/**
 * Compatibility shim: exposes the react-router-dom API used by the original
 * Delux codebase, backed by TanStack Router.
 */
import React, { useEffect } from "react";
import {
  Link as TanLink,
  Outlet,
  useNavigate as useTanNavigate,
  useParams as useTanParams,
  useRouterState,
} from "@tanstack/react-router";

export function Link({ to, children, ...rest }: any) {
  return (
    <TanLink to={to} {...rest}>
      {children}
    </TanLink>
  );
}

export function NavLink({ to, className, children, ...rest }: any) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive =
    pathname === to || (typeof to === "string" && pathname.startsWith(to + "/"));
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return (
    <TanLink to={to} className={cls} {...rest}>
      {typeof children === "function" ? children({ isActive }) : children}
    </TanLink>
  );
}

export function useNavigate() {
  const navigate = useTanNavigate();
  return (to: any, opts?: { replace?: boolean; state?: any }) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    return navigate({ to, replace: opts?.replace });
  };
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useTanParams({ strict: false }) as T;
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useSearchParams(): [URLSearchParams, (next: any) => void] {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  return [new URLSearchParams(searchStr), () => {}];
}

export function Navigate({ to }: { to: string; replace?: boolean }) {
  const navigate = useTanNavigate();
  useEffect(() => {
    navigate({ to, replace: true });
  }, [to]);
  return null;
}

export { Outlet };
