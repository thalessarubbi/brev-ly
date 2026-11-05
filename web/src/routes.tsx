import { createBrowserRouter } from 'react-router'
import { NotFound } from './pages/404'
import { Home } from './pages/app/home'
import { ShortUrl } from './pages/app/short-url'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/:shortUrl',
    element: <ShortUrl />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
