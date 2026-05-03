import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Explore from './pages/Explore'
import RecipeDetail from './pages/RecipeDetail'
import RecipeEditor from './pages/RecipeEditor'
import MyRecipes from './pages/MyRecipes'
import Categories from './pages/Categories'
import RecipeMedia from './pages/RecipeMedia'
import Premium from './pages/Premium'
import PremiumSuccess from './pages/PremiumSuccess'
import PremiumCancel from './pages/PremiumCancel'
import './index.css'
import { ToastProvider } from './components/Toast'
import { PremiumRoute } from './components/PremiumRoute'
import CookingMode from './pages/CookingMode'


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/premium" element={<Premium />} />
          <Route path="/premium/success" element={<PremiumSuccess />} />
          <Route path="/premium/cancel" element={<PremiumCancel />} />

          <Route path="/explore" element={<PremiumRoute><Explore /></PremiumRoute>} />
          <Route path="/recipe/:id" element={<PremiumRoute><RecipeDetail /></PremiumRoute>} />
          <Route path="/create" element={<RecipeEditor />} />
          <Route path="/edit/:id" element={<RecipeEditor />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/edit/:id/media" element={<RecipeMedia />} />

          <Route path="/recipe/:id/cook" element={<CookingMode />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
