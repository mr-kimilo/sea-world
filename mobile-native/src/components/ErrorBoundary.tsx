import { Component, type ReactNode } from "react";
import { HashRouter } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";

interface Props { children: ReactNode; }
interface State { hasError: boolean; detail: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, detail: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, detail: error.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <HashRouter>
          <ErrorPage />
        </HashRouter>
      );
    }
    return this.props.children;
  }
}
