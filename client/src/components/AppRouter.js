import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import React, { useContext, useEffect } from 'react';
import Tpl_main from "../templates/tpl_main";
import Main from "../pages/main/Main";
import Settings from "../pages/settings/Settings";
import Queue from "../pages/queue/Queue";
import Watcher from "../pages/watcher/Watcher";
import Presets from "../pages/presets/Presets";
import Auth from "../pages/auth/Auth";
import { StorageContext } from '../contex';
import PageHeader from "./nav/PageHeader";
import { checkAuth } from '../services/auth'; 

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(StorageContext);
  return user?.isAuth ? children : <Navigate to="/auth" replace />;
};

const AppRouter = () => {
  const { user, setUser } = useContext(StorageContext);
  const location = useLocation();
  
  // Проверяем, находимся ли мы на странице авторизации
  const isAuthPage = location.pathname === '/auth';
  
  useEffect(() => {
    const validateAuth = async () => {
      const userData = await checkAuth();
      if (userData) {
        setUser({
          ...userData,
          isAuth: true,
          login: userData.email || userData.username || null,
        });
      } else {
      }
    };

    if (user.isAuth === false && user.login === null) {
      validateAuth();
    }
  }, [setUser, location.pathname]);

  const routes = [
    { path: '/', element: <ProtectedRoute><Tpl_main page={<Main />} /></ProtectedRoute> },
    { path: '/main', element: <ProtectedRoute><Tpl_main page={<Main />} /></ProtectedRoute> },
    { path: '/settings', element: <ProtectedRoute><Tpl_main page={<Settings />} /></ProtectedRoute> },
    { path: '/queue', element: <ProtectedRoute><Tpl_main page={<Queue />} /></ProtectedRoute> },
    { path: '/watch', element: <ProtectedRoute><Tpl_main page={<Watcher />} /></ProtectedRoute> },
    { path: '/preset', element: <ProtectedRoute><Tpl_main page={<Presets />} /></ProtectedRoute> },
    { path: '/auth', element: <Tpl_main page={<Auth />} /> },
    { path: '*', element: <Navigate to="/" replace /> }
  ];

  const showHeader = user?.isAuth && !isAuthPage;

  return (
    <div className="container-fluid px-2 px-md-4 min-height-100 mt-4">
      {showHeader && (
        <div
          className="page-header min-height-100 border-radius-xl mt-4"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <span className="mask bg-gradient-dark opacity-6" />
        </div>
      )}
      
      <div className={`card card-body ${showHeader ? 'mx-2 mx-md-2 mt-n6' : 'mx-0 mt-0'}`}>
        {showHeader && (
          <div className="row gx-4 mb-2">
            <div className="col-auto my-auto">
              <PageHeader />
            </div>
          </div>
        )}
        
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
    </div>
  );
};

export default AppRouter;