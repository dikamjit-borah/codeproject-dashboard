import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home/Home";
import Transactions from "./pages/Transactions/Transactions";

export default function App() {
    return (
       <>
        <Router>
            <Routes>
                <Route element={<AppLayout />} >
                    <Route index path="/" element={<Home />} />

                    <Route path="/transactions" element={<Transactions />} />
                </Route>
            </Routes>
        </Router>
       </>
    )
}