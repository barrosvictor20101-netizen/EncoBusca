document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      const usuario = usuarios.find(user => user.email === email && user.senha === senha);

      if (usuario) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        window.location.href = 'painel.html';
      } else {
        alert('Email ou senha inválidos');
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('cadastroEmail').value;
      const senha = document.getElementById('cadastroSenha').value;

      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      const existe = usuarios.some(user => user.email === email);
      if (existe) {
        alert('Usuário já cadastrado!');
        return;
      }

      const novoUsuario = {
        email,
        senha,
        historico: []
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'index.html';
    });
  }
});


//codigo recuperação de senha


document.addEventListener('DOMContentLoaded', () => {
  const recuperarForm = document.getElementById('recuperarForm');
  if (recuperarForm) {
    recuperarForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('recuperarEmail').value;
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      const usuario = usuarios.find(user => user.email === email);

      if (usuario) {
        alert(`Senha para o email ${email}: ${usuario.senha}`);
      } else {
        alert('Email não encontrado!');
      }
    });
  }
});

// codigo painel principal consultas e historico 

document.addEventListener('DOMContentLoaded', () => {
  const painel = document.getElementById('consultaForm');
  const userEmailDisplay = document.getElementById('userEmail');
  const historicoList = document.getElementById('historicoList');
  const logoutBtn = document.getElementById('logoutBtn');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  if (painel) {
    if (!usuarioLogado) {
      alert('Você precisa estar logado.');
      window.location.href = 'index.html';
      return;
    }

    userEmailDisplay.textContent = `Logado como: ${usuarioLogado.email}`;

    // Carrega o histórico ao entrar
    mostrarHistorico();

    painel.addEventListener('submit', (e) => {
      e.preventDefault();

      const codigo = document.getElementById('codigoRastreio').value;

      if (codigo.trim() === '') return;

      // Simulando resposta dos Correios
      const mensagemErro = document.getElementById('mensagemErro');

fetch(`https://seurastreio.com.br/api/public/rastreio/${codigo}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const evento = data.eventoMaisRecente;
      const resultado = `${evento.descricao} (${evento.local} em ${new Date(evento.data).toLocaleString()})`;

      // Atualiza histórico
      usuarioLogado.historico.push({
        codigo,
        resultado,
        data: new Date().toLocaleString()
      });

      const index = usuarios.findIndex(u => u.email === usuarioLogado.email);
      if (index !== -1) {
        usuarios[index] = usuarioLogado;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      }

      document.getElementById('codigoRastreio').value = '';
      mostrarHistorico();

      mensagemErro.textContent = ''; // Limpa mensagem de erro caso exista
    } else {
      mensagemErro.textContent = `Código "${codigo}" não encontrado ou inválido. Por favor, verifique e tente novamente.`;
    }
  })
  .catch(err => {
    console.error(err);
    mensagemErro.textContent = 'Erro ao consultar a API de rastreio. Tente novamente mais tarde.';
  });



      // Atualiza usuário logado
      usuarioLogado.historico.push({
        codigo,
        resultado: resultadoSimulado,
        data: new Date().toLocaleString()
      });

      // Atualiza o localStorage com novo histórico
      const index = usuarios.findIndex(u => u.email === usuarioLogado.email);
      if (index !== -1) {
        usuarios[index] = usuarioLogado;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      }

      document.getElementById('codigoRastreio').value = '';
      mostrarHistorico();
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = 'index.html';
    });
  }

  function mostrarHistorico() {
    historicoList.innerHTML = '';

    if (usuarioLogado.historico.length === 0) {
      historicoList.innerHTML = '<li>Nenhuma consulta ainda.</li>';
      return;
    }

    usuarioLogado.historico.slice().reverse().forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.codigo}</strong> - ${item.resultado} <br><small>${item.data}</small>`;
      historicoList.appendChild(li);
    });
  }
});
