import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home/Home";
import Transactions from "./pages/Transactions/Transactions";
import SmileCoins from "./pages/SmileCoins/SmileCoins";
import Analytics from "./pages/Analytics/Analytics";
import Login from "./pages/Login/Login";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<PrivateRoute />}>
                        <Route element={<AppLayout />}>
                            <Route index path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/smile-coins" element={<SmileCoins />} />
                            <Route path="/analytics" element={<Analytics />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </>
    )
}