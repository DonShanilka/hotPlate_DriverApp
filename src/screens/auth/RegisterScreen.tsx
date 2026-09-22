import { useState } from "react";

function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    // if (
    //   !name.trim() ||
    //   !email.trim() ||
    //   !password.trim() ||
    //   !confirmPassword.trim()
    // ) {
    //   setError("Pleas fill all fields.")
    //   return;
    // }

    // try {
    //   setLoading(true);

    //   await apiPost
    // }
  };

  return <div>Register Screen</div>;
}

export default RegisterScreen;
