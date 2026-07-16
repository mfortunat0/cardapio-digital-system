import React, { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import axios from "axios";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/auth/login`,
        {
          username,
          password,
        },
      );
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        navigate("/admin");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className={styles["login-section"]}>
        <div className={styles["login-container"]}>
          <div className={styles["login-header"]}>
            <h1>La Maison</h1>
            <p>Painel Administrativo</p>
          </div>
          <div className={styles["divider-ornament"]}>
            <span className={styles.line}></span>
            <span className={styles.diamond}></span>
            <span className={styles.line}></span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="usuario">Usuário</label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                placeholder="Digite seu usuário"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles["btn-login"]}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className={styles["loading-spinner"]}
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: `${styles.spin} 0.8s linear infinite`,
                    }}
                  ></span>
                  Entrando...
                </>
              ) : (
                <>
                  <span>🔐</span> Entrar
                </>
              )}
            </button>

            <div
              className={`${styles["error-message"]} ${error ? styles.show : ""}`}
            >
              {error}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
