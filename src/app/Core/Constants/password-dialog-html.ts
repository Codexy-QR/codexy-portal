export const getPasswordDialogHTML = (options: {
	text?: string;
	inputPlaceholder?: string;
}): string => `
  ${options.text ? `
    <p style="
      text-align: center;
      margin-bottom: 1.5rem;
      color: #6b7280;
    ">
      ${options.text}
    </p>` : ''}

  <div
    class="password-input-container"
    style="
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    "
  >
    <div style="position: relative; width: 75%;">
      <input
        type="password"
        id="swal-password-input"
        class="swal2-input"
        placeholder="${options.inputPlaceholder || 'Ingresa tu contraseña'}"
        style="
          padding-right: 45px;
          margin: 0 !important;
          width: 100%;
          font-family: sans-serif;
        "
      >

      <button
        type="button"
        id="swal-toggle-password"
        class="password-toggle-btn"
        style="
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s ease;
          font-family: 'Material Icons';
          font-size: 20px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        onmouseover="this.style.color='#374151'"
        onmouseout="this.style.color='#6b7280'"
      >
        visibility
      </button>
    </div>
  </div>
`;
