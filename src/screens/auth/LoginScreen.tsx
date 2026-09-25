import React, { useState } from 'react'

import LoginImage from "@/assets/images/loginPage/LogingPage_main_mage.png";
import { useNavigation } from 'expo-router';

export default function LoginScreen() {

  const [formData, setFormData] = useState({email: '', password: ''})
  
  return (

    <div>
      Login Screen
    </div>
  )
}

