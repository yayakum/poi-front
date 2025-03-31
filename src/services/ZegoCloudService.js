// src/services/ZegoCloudService.js
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';

class ZegoCloudService {
  constructor() {
    // Usa tus credenciales de Zegocloud
    this.appID = 1830163647;
    this.serverSecret = '1581969af00b8279f62a9433ea82e791';
    this.zp = null;
    this.localStream = null;
    this.remoteStream = null;
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
      
      return {
        zp: this.zp,
        localStream: streams.localStream
      };
    } catch (error) {
      console.error("Error iniciando llamada:", error);
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
    const response = await axios.post('http://localhost:3000/api/calls/create', {
      iniciador_id: callerId,
      receptor_id: receiverId
    });
    return response.data;
  }
  
  // Actualiza estado en la BD
  async updateCallStatus(callId, status) {
    // Llama a tu API para actualizar el estado de la llamada
    const response = await axios.post('http://localhost:3000/api/calls/update-status', {
      callId: callId,
      estado: status
    });
    return response.data;
  }
}

export default new ZegoCloudService();