// src/services/ZegoCloudService.js
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ZegoCloudService {
  constructor() {
    // Usa tus credenciales de Zegocloud
    this.appID = 1830163647;
    this.serverSecret = '1581969af00b8279f62a9433ea82e791';
    this.zp = null;
    this.localStream = null;
    this.remoteStream = null;
  }
  
  // Verifica si estamos en un contexto seguro
  isSecureContext() {
    return window.isSecureContext;
  }

  // Verifica si estamos en localhost
  isLocalhost() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
  
  // Verificar permisos de medios antes de iniciar
  async checkMediaPermissions() {
    try {
      // Primero verificamos si estamos en un contexto no seguro en un dominio que no es localhost
      if (!this.isLocalhost() && !this.isSecureContext()) {
        console.warn('No es un contexto seguro ni localhost - es probable que falle el acceso a medios');
        // Retornamos pero no lanzamos error para permitir que la aplicación intente de todos modos
        // (podría funcionar en algunos navegadores o configuraciones)
      }

      // Intentar obtener permisos
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      // Liberar el stream después de la prueba
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Error en permisos de medios:', error);
      return false;
    }
  }
  
  // Genera token para Zegocloud
  async generateToken(roomId, userId, userName) {
    try {
      return ZegoUIKitPrebuilt.generateKitTokenForTest(
        this.appID,
        this.serverSecret,
        roomId,
        userId.toString(),
        userName
      );
    } catch (error) {
      console.error("Error generando token:", error);
      throw error;
    }
  }
  
  // Función para iniciar una llamada (solo conecta streams, no UI)
  async startCall(element, roomId, userId, userName, callbacks = {}) {
    try {
      // Verificar permisos primero
      const hasPermissions = await this.checkMediaPermissions();
      
      if (!hasPermissions) {
        // Intentar de todos modos pero advertir sobre posibles errores
        console.warn('Iniciando llamada sin permisos confirmados. Es posible que falle.');
      }
      
      // Generar token
      const token = await this.generateToken(roomId, userId, userName);
      
      // Crear instancia
      this.zp = ZegoUIKitPrebuilt.create(token);
      
      // Configurar streams pero sin UI
      const streams = await this.zp.addPlugins({
        ZegoSuperBoardManager: {}
      });
            
      // Conectar medios (audio/video)
      await this.zp.setLocalVideoView(element);
      
      // Eventos para manejo de streams remotos
      this.zp.on('roomUserUpdate', (roomID, updateType, userList) => {
        if (updateType === 'ADD' && callbacks.onUserConnected) {
          callbacks.onUserConnected(userList);
        } else if (updateType === 'DELETE' && callbacks.onUserDisconnected) {
          callbacks.onUserDisconnected(userList);
        }
      });
      
      // Manejar streams remotos
      this.zp.on('roomStreamUpdate', (roomID, updateType, streamList) => {
        if (updateType === 'ADD' && callbacks.onRemoteStreamAdded) {
          callbacks.onRemoteStreamAdded(streamList);
        }
      });

      // Manejar errores
      this.zp.on('error', (errorCode, errorMessage) => {
        console.error(`Error Zego: ${errorCode} - ${errorMessage}`);
        if (callbacks.onError) {
          callbacks.onError({
            code: errorCode,
            message: errorMessage
          });
        }
      });
      
      return {
        zp: this.zp,
        localStream: streams.localStream
      };
    } catch (error) {
      console.error("Error iniciando llamada:", error);
      
      // Si hay una devolución de llamada de error, llámala
      if (callbacks.onError) {
        callbacks.onError({
          code: 'START_CALL_ERROR',
          message: error.message || 'Error desconocido al iniciar llamada'
        });
      }
      
      throw error;
    }
  }
  
  // Terminar llamada
  endCall() {
    if (this.zp) {
      this.zp.leaveRoom();
      this.zp = null;
    }
  }
  
  // Funciones para controlar audio/video
  toggleMicrophone(enable) {
    if (this.zp) {
      if (enable) {
        this.zp.turnOnMicrophone();
      } else {
        this.zp.turnOffMicrophone();
      }
    }
  }
  
  toggleCamera(enable) {
    if (this.zp) {
      if (enable) {
        this.zp.turnOnCamera();
      } else {
        this.zp.turnOffCamera();
      }
    }
  }
  
  // Registro en la BD
  async registerCallInDB(callerId, receiverId) {
    // Llama a tu API para registrar la llamada
    // const response = await axios.post(`${API_URL}/api/calls/create`, {
      const response = await axios.post('https://poi-back-v6at.onrender.com/api/calls/create', {
      iniciador_id: callerId,
      receptor_id: receiverId
    });
    return response.data;
  }
  
  // Actualiza estado en la BD
  async updateCallStatus(callId, status) {
    // Llama a tu API para actualizar el estado de la llamada
    // const response = await axios.post(`${API_URL}/api/calls/update-status`, {
      // const response = await axios.post('https://poi-back-xi.vercel.app/api/calls/update-status', {
        const response = await axios.post('https://poi-back-v6at.onrender.com/calls/update-status', {
      callId: callId,
      estado: status
    });
    return response.data;
  }
}

export default new ZegoCloudService();