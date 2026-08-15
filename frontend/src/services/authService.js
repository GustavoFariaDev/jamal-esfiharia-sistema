const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

class AuthService {
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.status === 'success' && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }

      return { success: false, message: data.message || 'Erro ao fazer login' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  }

  async register(username, email, password) {
    try {
      // A criacao de usuario mora em /users/register; /auth/ so tem login e verify.
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Erro ao registrar' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      // localStorage corrompido derrubava a aplicacao inteira na primeira
      // renderizacao, com tela branca e sem como sair: o ProtectedRoute chama
      // isAdmin() -> getUser() antes de qualquer coisa aparecer.
      this.logout();
      return null;
    }
  }

  /**
   * Le a validade gravada dentro do proprio token (claim `exp`, em segundos).
   * Devolve null quando o token nao e um JWT legivel.
   */
  getExpiracao() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Autenticado = tem token E ele ainda nao venceu.
   *
   * Antes bastava EXISTIR token. O do sistema dura 24h, entao no dia seguinte
   * o painel continuava se achando logado: abria normalmente e cada tela
   * carregava vazia ou com erro, porque toda chamada voltava 401. O caminho
   * certo — cair na tela de login — so acontecia se a pessoa limpasse o
   * navegador. Token vencido agora e o mesmo que token nenhum.
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    const expiraEm = this.getExpiracao();
    if (expiraEm && Date.now() >= expiraEm) {
      this.logout();
      return false;
    }
    return true;
  }

  isAdmin() {
    const user = this.getUser();
    return user && user.is_admin === true;
  }
}

export default new AuthService();

