import { FormEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./main";
import { authenticationStyles as styles } from "./AuthenticationViewStyles";

export const AUTHENTICATION_VIEW_ID = "authentication-view-container";

type AuthMode = "login" | "register";

function AuthenticationForm()
{
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isRegisterMode = mode === "register";

  const loginButtonStyle =
    mode === "login"
      ? { ...styles.modeButton, ...styles.modeButtonActive }
      : { ...styles.modeButton, ...styles.modeButtonInactive };

  const registerButtonStyle =
    mode === "register"
      ? { ...styles.modeButton, ...styles.modeButtonActive }
      : { ...styles.modeButton, ...styles.modeButtonInactive };

  async function handleSubmit(event: FormEvent<HTMLFormElement>)
  {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password.trim())
    {
      setErrorMessage("Email and password are required.");

      return;
    }

    if (isRegisterMode && !username.trim())
    {
      setErrorMessage("Username is required.");

      return;
    }

    if (isRegisterMode && password !== confirmPassword)
    {
      setErrorMessage("Passwords do not match.");

      return;
    }

    setLoading(true);

    if (isRegisterMode)
    {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error)
      {
        setErrorMessage(error.message);
      }

      try
      {
        const user = (await supabase.auth.getUser()).data.user;

        if (user)
        {
          const uid = user.id;

          await supabase
            .from("UserData")
            .insert({ uid, userName: username, wins: 0, win_balance: 1, active_games: [] })
            .select();
        }
      }
      catch (e: unknown)
      {
        if (e instanceof Error)
        {
          setErrorMessage(e.message);
        }
        else
        {
          setErrorMessage("An unknown error occurred.");
        }
      }
    }
    else
    {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error)
      {
        setErrorMessage(error.message);
      }
    }

    setLoading(false);
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isRegisterMode ? "Create account" : "Welcome back"}
        </h2>

        <div style={styles.modeToggleContainer}>
          <button
            type="button"
            style={loginButtonStyle}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            style={registerButtonStyle}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <label style={styles.label} htmlFor="auth-username">
                Username
              </label>
              <input
                id="auth-username"
                style={styles.input}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </>
          )}

          <label style={styles.label} htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            style={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label style={styles.label} htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            style={styles.input}
            type="password"
            autoComplete={isRegisterMode ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {isRegisterMode && (
            <>
              <label style={styles.label} htmlFor="auth-confirm-password">
                Confirm password
              </label>
              <input
                id="auth-confirm-password"
                style={styles.input}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </>
          )}

          {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegisterMode
                ? "Create account"
                : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export async function createAuthenticationView(container: HTMLElement)
{
  container.innerHTML = "";

  const root = createRoot(container);

  root.render(<AuthenticationForm />);

  return root;
}
