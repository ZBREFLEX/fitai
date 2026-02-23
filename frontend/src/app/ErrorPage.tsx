import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "./components/ui/button";
import { AlertCircle, Home, RotateCcw } from "lucide-react";

export function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage = "An unexpected error occurred.";
    let errorStatus = "Error";

    if (isRouteErrorResponse(error)) {
        errorStatus = error.status.toString();
        errorMessage = error.statusText || error.data?.message || errorMessage;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground font-sans">
            <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center bg-red-100 rounded-full dark:bg-red-900/30">
                    <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full border-4 border-background">
                        {errorStatus}
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Oops! Something's wrong.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-sm mx-auto">
                        {errorMessage}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate(-1)}
                    >
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Go Back
                    </Button>
                    <Button
                        size="lg"
                        className="w-full shadow-lg shadow-primary/20"
                        onClick={() => navigate("/")}
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Home
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground pt-8 italic">
                    If this keeps happening, please contact support.
                </p>
            </div>
        </div>
    );
}
