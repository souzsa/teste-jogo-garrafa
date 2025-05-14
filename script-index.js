document.addEventListener('DOMContentLoaded', function() {
    const abrirRegras = document.getElementById('abrir-regras');
    const fecharRegras = document.getElementById('fechar-regras');
    const modalRegras = document.getElementById('modal-regras');
    const iniciarBtn = document.getElementById('iniciar');

    // Abrir modal de regras
    abrirRegras.addEventListener('click', function() {
        modalRegras.style.display = 'flex';
    });

    // Fechar modal de regras
    fecharRegras.addEventListener('click', function() {
        modalRegras.style.display = 'none';
    });

    // Fechar modal ao clicar fora
    modalRegras.addEventListener('click', function(e) {
        if (e.target === modalRegras) {
            modalRegras.style.display = 'none';
        }
    });

    // Iniciar jogo
    iniciarBtn.addEventListener('click', function() {
        const nivel = document.getElementById('nivel').value;
        localStorage.setItem('configJogo', nivel);
        window.location.href = 'jogo.html';
    });
});