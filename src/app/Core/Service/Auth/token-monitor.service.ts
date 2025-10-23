import { Injectable, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

// SIN USO!!
@Injectable({ providedIn: 'root' })
export class TokenMonitorService {

	// Inyección de servicios propios del proyecto
  private authService = inject(AuthService);

  private warningThreshold = 30;
  private intervalId: any;
  private activityListenerAttached = false;
  private warned = false;

  startMonitoring(): void {
    if (!this.authService.isAuthenticated()) return;

    this.setupActivityListener();
    this.scheduleTokenCheck();
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.warned = false;
  }

  private setupActivityListener(): void {
    if (this.activityListenerAttached) return;

    const renewTokenOnActivity = () => {
      if (this.warned) {
        this.authService.refreshToken().subscribe({
          next: (res) => {
            this.authService.saveToken(res.token);
            Swal.close();
            this.warned = false;
            this.scheduleTokenCheck(); // reiniciar monitoreo
          },
          error: () => this.forceLogout()
        });
      }
    };

    window.addEventListener('click', renewTokenOnActivity);
    window.addEventListener('keydown', renewTokenOnActivity);

    this.activityListenerAttached = true;
  }

  private scheduleTokenCheck(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      const token = this.authService.getToken();
      if (!token) return;

      const { exp } = this.authService.getTokenPayload();
      const timeLeft = exp * 1000 - Date.now();

      if (timeLeft <= 0) {
        this.forceLogout();
      } else if (timeLeft <= this.warningThreshold * 1000 && !this.warned) {
        this.warned = true;
        this.warnBeforeLogout(Math.floor(timeLeft / 1000));
      }
    }, 5000);
  }

  private async warnBeforeLogout(secondsLeft: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Tu sesión está por expirar',
      html: `Tu sesión expirará en <b>${secondsLeft}</b> segundos.<br>Presiona una tecla o haz clic para mantenerla activa.`,
      icon: 'warning',
      showConfirmButton: false,
      timer: secondsLeft * 1000,
      timerProgressBar: true,
      didClose: () => {
        if (this.warned) this.forceLogout(); // si no reaccionó
      }
    });
  }

  private forceLogout(): void {
    // this.authService.logout();
    Swal.fire({
      title: 'Sesión cerrada',
      text: 'Tu sesión ha expirado por inactividad.',
      icon: 'info',
      timer: 3000
    });
  }
}
