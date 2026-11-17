// Storage denial falls back to a playable in-memory profile.
import { SAVE_KEY } from './config.js';
export function loadProfile(){try{return Object.assign({cash:2450,completed:0,best:0},JSON.parse(localStorage.getItem(SAVE_KEY)||'{}'));}catch{return {cash:2450,completed:0,best:0};}}
export function saveProfile(profile){try{localStorage.setItem(SAVE_KEY,JSON.stringify(profile));}catch{}}
