// src/pages/Login/Login.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Credenciais de demonstração (substituir pela API real)
  const CREDENCIAIS = {
    usuario: "admin",
    senha: "admin123",
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedUsuario = usuario.trim();
    const trimmedSenha = senha.trim();

    if (!trimmedUsuario || !trimmedSenha) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    // Simula chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Validação (mock)
    if (
      trimmedUsuario === CREDENCIAIS.usuario &&
      trimmedSenha === CREDENCIAIS.senha
    ) {
      localStorage.setItem("laMaisonAuth", "true");
      localStorage.setItem("laMaisonUser", trimmedUsuario);
      navigate("/admin"); // Redireciona para o painel
    } else {
      setError("Usuário ou senha inválidos.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {/* Vídeo de fundo */}
      <video
        className={styles["background-video"]}
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="https://videos.pexels.com/video-files/3196277/3196277-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
        <img
          src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
          alt="cozinha"
          className={styles["fallback-image"]}
        />
      </video>
      <div className={styles["background-overlay"]}></div>

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
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
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

        <button onClick={handleBack} className={styles["back-link"]}>
          ← Voltar ao cardápio
        </button>
      </div>
    </>
  );
};

export default Login;
