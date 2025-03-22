// avatarConfig.js
// Este archivo centraliza la configuración de avatares

// Importamos las imágenes de avatares desde la carpeta assets
import BMO from '../assets/BMO.jpg';
import BonnibelBubblegum from '../assets/BonnibelBubblegum.jpg';
import Finn from '../assets/Finn.jpg';
import FlamePrincess from '../assets/FlamePrincess.jpg';
import Gunter from '../assets/Gunter.jpg';
import IceKing from '../assets/IceKing.jpg';
import Jake from '../assets/Jake.jpg';
import LadyRainicorn from '../assets/LadyRainicorn.jpg';
import Lemongrab from '../assets/Lemongrab.jpg';
import LumpySpacePrincess from '../assets/LumpySpacePrincess.jpg';
import Marcelline from '../assets/Marcelline.jpg';

// Define los avatares disponibles por defecto (sin necesidad de recompensa)
export const DEFAULT_AVATARS = [
  { src: BonnibelBubblegum, name: 'assets/BonnibelBubblegum.jpg' },
  { src: Finn, name: 'assets/Finn.jpg' },
  { src: Jake, name: 'assets/Jake.jpg' },
  { src: Marcelline, name: 'assets/Marcelline.jpg' },
];

// Define los avatares que requieren recompensa (actualizados según la base de datos)
export const REWARD_AVATARS = [
  { src: FlamePrincess, name: 'assets/FlamePrincess.jpg', reward: true, pointsCost: 3000 },
  { src: Gunter, name: 'assets/Gunter.jpg', reward: true, pointsCost: 5000 },
  { src: LadyRainicorn, name: 'assets/LadyRainicorn.jpg', reward: true, pointsCost: 600 },
  { src: Lemongrab, name: 'assets/Lemongrab.jpg', reward: true, pointsCost: 100 },
  { src: LumpySpacePrincess, name: 'assets/LumpySpacePrincess.jpg', reward: true, pointsCost: 700 },
  { src: BMO, name: 'assets/BMO.jpg', reward: true, pointsCost: 10000 },
  { src: IceKing, name: 'assets/IceKing.jpg', reward: true, pointsCost: 30000 },
];

// Función para obtener la imagen de avatar correspondiente por nombre
export const getAvatarByName = (avatarName) => {
  if (!avatarName) return null;
  
  // Buscar en avatares por defecto
  const defaultAvatar = DEFAULT_AVATARS.find(opt => opt.name === avatarName);
  if (defaultAvatar) return defaultAvatar.src;
  
  // Buscar en avatares de recompensa
  const rewardAvatar = REWARD_AVATARS.find(opt => opt.name === avatarName);
  if (rewardAvatar) return rewardAvatar.src;
  
  return null;
};

// Función para verificar si un avatar está disponible para el usuario
export const isAvatarAvailable = (avatarName, redeemedRewards = []) => {
  // Si el avatar es uno de los predeterminados, está disponible
  if (DEFAULT_AVATARS.some(a => a.name === avatarName)) {
    return true;
  }
  
  // Si está en la lista de recompensas y el usuario lo ha canjeado, está disponible
  const isRedeemed = redeemedRewards.some(
    reward => reward.reward === avatarName || reward.recompensa === avatarName
  );
  
  return isRedeemed;
};

// Obtener todos los avatares (para el selector en EditProfile)
export const getAllAvatars = (redeemedRewards = []) => {
  return [
    ...DEFAULT_AVATARS,
    ...REWARD_AVATARS.map(avatar => ({
      ...avatar,
      available: isAvatarAvailable(avatar.name, redeemedRewards)
    }))
  ];
};