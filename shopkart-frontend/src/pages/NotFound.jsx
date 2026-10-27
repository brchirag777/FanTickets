import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <span className="text-7xl mb-4">🎸</span>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                404
            </h1>
            <h2 className="mt-2 text-2xl font-bold text-white">Show / Page Not Found</h2>
            <p className="max-w-md mt-2 text-zinc-400">
                The stage is empty here! The concert page or ticket you were looking for doesn't exist or has moved.
            </p>
            <div className="flex gap-4 mt-8">
                <Link
                    to="/tickets"
                    className="px-6 py-3 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-600/20"
                >
                    Browse Live Shows
                </Link>
                <Link
                    to="/"
                    className="px-6 py-3 font-medium transition-colors border rounded-lg text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
