import {
  createElement,
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  createCustomCanvas,
  type CanvasConfig,
  type ViewContentProvider,
} from "./CanvasUtils";
import { startGame, destroyGame } from "bubbo-client";
import { supabase } from "./main";

export const GAMES_VIEW_ID = "games-view-container";
const GAME_ENTRY_FEE_GBP = 1;

const stripePublicKey =
  typeof import.meta.env.VITE_STRIPE_PUBLIC_KEY === "string"
    ? import.meta.env.VITE_STRIPE_PUBLIC_KEY.trim()
    : "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

type PaymentIntentResponse = {
  clientSecret?: string;
  error?: string;
};

export type GameItem = {
  id: string;
  title: string;
  image: string;
  description: string;
  onPlay?: () => void;
};

export const gamesCatalog: GameItem[] = [
  {
    id: "neon-drift",
    title: "Neon Drift",
    image: "https://picsum.photos/seed/neon-drift/420/240",
    description:
      "Drift through neon city loops and chain speed boosts for leaderboard points.",
    onPlay: () => {
      window.open(
        "https://your-game-url.example.com",
        "_blank",
        "noopener,noreferrer",
      );
      console.log("Play clicked: Neon Drift");
    },
  },
  {
    id: "sky-ruins",
    title: "Sky Ruins",
    image: "https://picsum.photos/seed/sky-ruins/420/240",
    description:
      "Explore floating ruins, solve traversal puzzles, and unlock hidden relic paths.",
    onPlay: () => {
      window.open(
        "https://your-game-url.example.com",
        "_blank",
        "noopener,noreferrer",
      );
      console.log("Play clicked: Sky Ruins");
    },
  },
  {
    id: "byte-brawl",
    title: "Byte Brawl",
    image: "https://picsum.photos/seed/byte-brawl/420/240",
    description:
      "Fast arena rounds with power-ups, combo abilities, and instant rematches.",
    onPlay: () => {
      console.log("Play clicked: Byte Brawl");
    },
  },
];

const gamesStyles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: "18px 14px 26px",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    background:
      "linear-gradient(155deg, #192231 0%, #243a58 55%, #335f89 100%)",
  },
  heading: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: "38px",
    fontWeight: 800,
    lineHeight: 1.05,
  },
  subheading: {
    margin: "0 0 18px",
    color: "#dbe7ff",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  card: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    background: "rgba(15, 23, 42, 0.6)",
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    display: "block",
  },
  content: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
  },
  gameTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 700,
  },
  gameDescription: {
    margin: 0,
    color: "#dbe7ff",
    fontSize: "16px",
    lineHeight: 1.5,
    flex: 1,
  },
  playButton: {
    border: "none",
    borderRadius: "11px",
    padding: "14px 12px",
    fontSize: "17px",
    minHeight: "50px",
    fontWeight: 700,
    background: "#22c55e",
    color: "#052e16",
    cursor: "pointer",
  },
  unlockButton: {
    background: "#f59e0b",
    color: "#111827",
  },
  playButtonDisabled: {
    background: "#94a3b8",
    color: "#1e293b",
    cursor: "not-allowed",
    opacity: 0.9,
  },
  lockNotice: {
    margin: 0,
    color: "#fcd34d",
    fontSize: "14px",
    fontWeight: 700,
  },
  helperText: {
    margin: 0,
    color: "#bfdbfe",
    fontSize: "13px",
  },
  errorText: {
    margin: 0,
    color: "#fecaca",
    fontSize: "13px",
    fontWeight: 600,
  },
  paymentPanel: {
    marginTop: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.55)",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  paymentSubmitButton: {
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#22c55e",
    cursor: "pointer",
  },
  cancelButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#ef4444",
    cursor: "pointer",
  },
};

type UnlockPaymentFormProps = {
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function UnlockPaymentForm({
  amount,
  onSuccess,
  onError,
}: UnlockPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe is still loading. Please try again.");
      return;
    }

    setSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return createElement(
    "form",
    { onSubmit: (event) => void handleSubmit(event) },
    createElement(PaymentElement),
    createElement(
      "button",
      {
        type: "submit",
        disabled: submitting || !stripe || !elements,
        style: {
          ...gamesStyles.paymentSubmitButton,
          marginTop: "10px",
          opacity: submitting || !stripe || !elements ? 0.7 : 1,
          cursor:
            submitting || !stripe || !elements ? "not-allowed" : "pointer",
        },
      },
      submitting ? "Processing..." : `Pay GBP ${amount.toFixed(2)}`,
    ),
  );
}

function GamesCatalogPanel({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [activeGames, setActiveGames] = useState<string[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [purchasingGameId, setPurchasingGameId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccess() {
      if (!isAuthenticated) {
        setActiveGames([]);
        setAccessError("");
        return;
      }

      setLoadingAccess(true);
      setAccessError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setActiveGames([]);
          return;
        }

        const { data, error } = await supabase
          .from("UserData")
          .select("active_games")
          .eq("uid", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        const resolvedGames = Array.isArray(data?.active_games)
          ? (data.active_games as string[])
          : [];
        setActiveGames(resolvedGames);
      } catch (error) {
        setAccessError(
          error instanceof Error
            ? error.message
            : "Failed to load game access.",
        );
      } finally {
        setLoadingAccess(false);
      }
    }

    void loadAccess();
  }, [isAuthenticated]);

  function runGame(game: GameItem) {
    if (game.onPlay) {
      game.onPlay();
      return;
    }

    console.log(`Play clicked: ${game.title}`);
  }

  function userHasAccess(gameId: string): boolean {
    return activeGames.includes(gameId);
  }

  async function startPayment(gameId: string): Promise<void> {
    setPaymentError("");

    if (!stripePromise) {
      setPaymentError(
        "Stripe is not configured. Missing VITE_STRIPE_PUBLIC_KEY in frontend env.",
      );
      return;
    }

    setCreatingPaymentIntent(true);
    setPurchasingGameId(gameId);
    setClientSecret(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to unlock a game.");
      }

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: GAME_ENTRY_FEE_GBP,
          userId: user.id,
          gameId,
        }),
      });

      const payload = (await response.json()) as PaymentIntentResponse;
      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error ?? "Failed to create payment intent.");
      }

      setClientSecret(payload.clientSecret);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Could not initialize payment.",
      );
      setPurchasingGameId(null);
      setClientSecret(null);
    } finally {
      setCreatingPaymentIntent(false);
    }
  }

  async function unlockGameAndPlay(game: GameItem): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPaymentError("You must be logged in to unlock a game.");
      return;
    }

    const nextActiveGames = userHasAccess(game.id)
      ? activeGames
      : [...activeGames, game.id];

    const { error } = await supabase
      .from("UserData")
      .update({ active_games: nextActiveGames })
      .eq("uid", user.id);

    if (error) {
      setPaymentError(error.message);
      return;
    }

    setActiveGames(nextActiveGames);
    setPaymentError("");
    setClientSecret(null);
    setPurchasingGameId(null);
    runGame(game);
  }

  function cancelPaymentFlow() {
    setPaymentError("");
    setClientSecret(null);
    setPurchasingGameId(null);
  }

  function handlePlay(game: GameItem) {
    if (!isAuthenticated) {
      return;
    }

    if (userHasAccess(game.id)) {
      runGame(game);
      return;
    }

    void startPayment(game.id);
  }

  const entryFeeLabel = `£${GAME_ENTRY_FEE_GBP.toFixed(2)}`;

  return createElement(
    "section",
    { style: gamesStyles.page },
    createElement("h1", { style: gamesStyles.heading }, "Games"),
    createElement(
      "p",
      { style: gamesStyles.subheading },
      "Pay once per game to unlock permanent access on your account.",
    ),
    loadingAccess &&
      createElement(
        "p",
        { style: gamesStyles.helperText },
        "Loading access...",
      ),
    accessError &&
      createElement("p", { style: gamesStyles.errorText }, accessError),
    createElement(
      "div",
      { style: gamesStyles.grid },
      ...gamesCatalog.map((game) =>
        (() => {
          const unlocked = userHasAccess(game.id);
          const isThisPayment = purchasingGameId === game.id;
          const buttonStyle = !isAuthenticated
            ? {
                ...gamesStyles.playButton,
                ...gamesStyles.playButtonDisabled,
              }
            : unlocked
              ? gamesStyles.playButton
              : {
                  ...gamesStyles.playButton,
                  ...gamesStyles.unlockButton,
                };

          return createElement(
            "article",
            { key: game.id, style: gamesStyles.card },
            createElement("img", {
              src: game.image,
              alt: `${game.title} cover image`,
              style: gamesStyles.image,
            }),
            createElement(
              "div",
              { style: gamesStyles.content },
              createElement("h2", { style: gamesStyles.gameTitle }, game.title),
              createElement(
                "p",
                { style: gamesStyles.gameDescription },
                game.description,
              ),
              createElement(
                "button",
                {
                  type: "button",
                  style: {
                    ...buttonStyle,
                    opacity:
                      creatingPaymentIntent && isThisPayment
                        ? 0.75
                        : buttonStyle.opacity,
                  },
                  onClick: () => handlePlay(game),
                  disabled:
                    !isAuthenticated ||
                    (creatingPaymentIntent && isThisPayment),
                },
                !isAuthenticated
                  ? "Log in to play"
                  : unlocked
                    ? "Play"
                    : creatingPaymentIntent && isThisPayment
                      ? "Preparing checkout..."
                      : `ENTER || ${entryFeeLabel}`,
              ),
              !isAuthenticated &&
                createElement(
                  "p",
                  { style: gamesStyles.lockNotice },
                  "Sign in or register to launch games.",
                ),
              isAuthenticated &&
                !unlocked &&
                createElement(
                  "p",
                  { style: gamesStyles.helperText },
                  "One-time unlock. Stored in active_games after successful payment.",
                ),
              isThisPayment &&
                createElement(
                  "div",
                  { style: gamesStyles.paymentPanel },
                  createElement(
                    "p",
                    { style: gamesStyles.helperText },
                    `Checkout for ${game.title}: ${entryFeeLabel}`,
                  ),
                  clientSecret && stripePromise
                    ? createElement(
                        Elements,
                        {
                          stripe: stripePromise,
                          options: { clientSecret },
                        },
                        createElement(UnlockPaymentForm, {
                          amount: GAME_ENTRY_FEE_GBP,
                          onSuccess: () => void unlockGameAndPlay(game),
                          onError: (message) => {
                            setPaymentError(message);
                          },
                        }),
                      )
                    : createElement(
                        "p",
                        { style: gamesStyles.helperText },
                        "Waiting for payment form...",
                      ),
                  paymentError &&
                    createElement(
                      "p",
                      { style: gamesStyles.errorText },
                      paymentError,
                    ),
                  createElement(
                    "button",
                    {
                      type: "button",
                      onClick: cancelPaymentFlow,
                      style: gamesStyles.cancelButton,
                    },
                    "Cancel",
                  ),
                ),
            ),
          );
        })(),
      ),
    ),
  );
}

class GamesViewContentProvider implements ViewContentProvider {
  constructor(private readonly isAuthenticated: boolean) {}

  async setupContent(): Promise<void> {
    // Render-only view; no imperative setup required.
  }

  renderContent() {
    return createElement(GamesCatalogPanel, {
      isAuthenticated: this.isAuthenticated,
    });
  }
}

export async function createGamesView(
  container: HTMLElement,
  isAuthenticated = false,
) {
  const config: CanvasConfig = {
    backgroundColor: "#a0439b",
    containerId: GAMES_VIEW_ID,
  };

  const contentProvider = new GamesViewContentProvider(isAuthenticated);
  return await createCustomCanvas(container, config, contentProvider);
}
