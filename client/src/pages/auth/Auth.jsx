import React from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../../http/auth_user"; 
import { useStorage, useNotification } from "../../contex";
import { t } from '../../utils/t18';
import { useForm } from "react-hook-form";

const Auth = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { setUser } = useStorage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
    mode: 'onChange'
  });

    const onSubmit = async (data) => {
    try {
      const response = await login(data.username, data.password, data.remember);

      if (response?.message) {
        showNotification("error", response.message);
        return;
      }

      setUser({
        ...response.user,
        isAuth: true,
        login: response.user.email || response.user.username,
      });

      showNotification("success", t('Auth_64'));
      navigate('/main', { replace: true }); 
    } catch (error) {
      const message = error?.response?.data?.message || error.message || t('Auth_error_generic');
      showNotification("error", message);
    }
  };

  const now_year = new Date().getFullYear();

  return (
    <>
      <div className="container position-sticky z-index-sticky top-0">
        <div className="row">
          <div className="col-12"></div>
        </div>
      </div>
      <main className="main-content mt-0">
        <div
          className="page-header align-items-start min-vh-100"
          style={{ backgroundImage: "url('./assets/img/bg-login.jpg')" }}
        >
          <span className="mask bg-gradient-dark opacity-6"></span>
          <div className="container my-auto">
            <div className="row">
              <div className="col-lg-4 col-md-8 col-12 mx-auto">
                <div className="card z-index-0 fadeIn3 fadeInBottom">
                  <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                    <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                      <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">
                        {t('Auth_66')}
                      </h4>
                    </div>
                  </div>
                  <div className="card-body">
                    <form role="form" className="text-start" onSubmit={handleSubmit(onSubmit)}>
                      <div className="input-group input-group-outline my-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Email"
                          {...register('username', { required: true })}
                        />
                      </div>
                      <div className="input-group input-group-outline mb-3">
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Password"
                          {...register('password', { required: true })}
                        />
                      </div>
                      <div className="form-check form-switch d-flex align-items-center mb-3">
                        <input
                          {...register('remember')}
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label className="form-check-label mb-0 ms-3" htmlFor="rememberMe">
                          {t('Auth_65')}
                        </label>
                      </div>
                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn bg-gradient-primary w-100 my-4 mb-2"
                        >
                          {t('Auth_66')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer position-absolute bottom-2 py-2 w-100">
            <div className="container">
              <div className="row align-items-center justify-content-lg-between">
                <div className="col-12 col-md-6 my-auto">
                  <div className="copyright text-center text-sm text-white text-lg-start">
                    © {now_year}
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Auth;