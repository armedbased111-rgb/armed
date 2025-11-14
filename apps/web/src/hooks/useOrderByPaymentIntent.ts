// apps/web/src/hooks/useOrderByPaymentIntent.ts
import { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";

export interface OrderInfo {
  id: string;
  buyerEmail: string;
  totalCents: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function useOrderByPaymentIntent(paymentIntentId: string | null) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!paymentIntentId) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchOrder = async () => {
      setLoading(true);

      try {
        const url = buildApiUrl(`orders/by-payment-intent/${paymentIntentId}`);
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404 && retryCount < 10) {
            // Order not found yet, retry in 1 second
            console.log(`Order not found yet, retrying in 1s... (attempt ${retryCount + 1}/10)`);
            timeoutId = setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, 1000);
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order");
        }

        const data = await response.json();
        
        if (isMounted) {
          setOrderId(data.orderId);
          setOrder(data.order);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
          console.error("Error fetching order by payment intent:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [paymentIntentId, retryCount]);

  return { orderId, order, loading, error, retryCount };
}

