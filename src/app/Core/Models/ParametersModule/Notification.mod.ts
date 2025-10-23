// ==================================================
// Modelos: Notificaciones del sistema
// ==================================================
// Contiene las estructuras necesarias para manejar notificaciones en la aplicación,
// tanto en su forma básica como extendida con datos de usuario.

export interface NotificationOptionsMod {
	id: number;
	title: string;
	type: number;
	content: string;
	date: string;
	read: boolean;
	userId: number;
}

export interface NotificationMod {
	id: number;
	title: string;
	type: number;
	typeName: string;
	content: string;
	date: string;
	read: boolean;
	userId: number;
	username: string;
}

export interface InventoryRequestNotificationMod {
	id: number;
	title: string;
	type: number;
	content: InventoryRequestMod;
	date: string;
	read: boolean;
	userId: number;
}

export interface InventoryRequestMod {
	inventaryId: number;
	inventaryDate: string;
	operatingGroupName: string;
	checkerName: string;
	checkerObservation: string;
	differences: InventoryRequestItemMod[];
}

export interface InventoryRequestItemMod {
	itemId: number;
	code: string;
	name: string;
	category: string;
	baseState: string;
	inventaryState: string;
}

export interface HeaderNotificationMod {
  id: number;
  title: string;
  content: string;
  type: number;
  date: string;
  isInventoryRequest: boolean;
}

export interface HeaderNotificationsResponseMod {
  unreadCount: number;
  notifications: HeaderNotificationMod[];
}
