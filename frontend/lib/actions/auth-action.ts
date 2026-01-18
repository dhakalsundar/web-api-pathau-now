'use client';

import { login, register } from "../api/auth";


export async function handleRegister(registrationData: any) {
  try {
    const result = await register(registrationData);

    if (result.success) {
      return { success: true, message: 'Registration successful', data: result.data };
    }

    return { success: false, message: result.message || 'Registration failed' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function handleLogin(loginData: any) {
    try{
        const result = await login(loginData);
        if(result.success){
            
            return { 
                success: true,
                message: 'Login successful', 
                data: result.data 
            };
        }
        return { success: false, message: result.message || 'Login failed' };
    }catch(error: Error | any){
        console.log(error)
        return { success: false, message: error.message };
    }
}