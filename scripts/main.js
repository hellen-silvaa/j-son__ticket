document.addEventListener('DOMContentLoaded', () => {
    const carousels = ['shows', 'filmes', 'eventos'];

    carousels.forEach(carouselId => {
        const track = document.querySelector(`#${carouselId} .carrossel__track`);
        const items = Array.from(track.children);
        const itemWidth = items[0].getBoundingClientRect().width;

        // Clonar os itens para criar um efeito de loop infinito
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });

        let currentIndex = 0;

        function moveToIndex(index) {
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${index * itemWidth}px)`;
        }

        function moveLeft() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = items.length - 1;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s ease-in-out';
                    currentIndex--;
                    moveToIndex(currentIndex);
                }, 50);
                return;
            }
            moveToIndex(currentIndex);
        }

        function moveRight() {
            currentIndex++;
            moveToIndex(currentIndex);
            if (currentIndex >= items.length) {
                setTimeout(() => {
                    track.style.transition = 'none';
                    currentIndex = 0;
                    track.style.transform = `translateX(0px)`;
                    setTimeout(() => {
                        track.style.transition = 'transform 0.5s ease-in-out';
                    }, 50);
                }, 500);
            }
        }

        document.querySelector(`#${carouselId} .carrossel__button--left`).addEventListener('click', moveLeft);
        document.querySelector(`#${carouselId} .carrossel__button--right`).addEventListener('click', moveRight);

        setInterval(moveRight, 3000); 
    });

    // Adicionar o botão "Close" na seção do carrinho
    const carrinho = document.getElementById('carrinho');
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('cart__close-button');
    carrinho.appendChild(closeButton);

    // Adicionar evento de clique ao botão "Close"
    closeButton.addEventListener('click', () => {
        carrinho.classList.remove('visible');
        const carrossel = document.getElementById('carrossel');
        carrossel.classList.remove('reduced');
    });
});

// Função para buscar filmes
async function fetchFilmes() {
    const response = await fetch('http://localhost:3000/filmes');
    const filmes = await response.json();
    return filmes;
}

// Função para comprar ingresso
async function comprarIngresso(filmeId) {
    const response = await fetch(`http://localhost:3000/filmes/${filmeId}`);
    const filme = await response.json();
    const carrinhoMain = document.querySelector('.cart__main');
    const carrinhoItem = document.createElement('div');
    carrinhoItem.classList.add('cart__item');
    carrinhoItem.dataset.id = filmeId; // Adiciona um identificador único ao item do carrinho
    const preco = filme.preco ? filme.preco : 0;
    const imagem = filme.imagem ? filme.imagem : 'https://via.placeholder.com/150';
    carrinhoItem.innerHTML = `
        <img src="${imagem}" alt="${filme.nome}" class="cart__image">
        <div class="cart__details">
            <div class="cart__item-title">${filme.nome}</div>
            <div class="cart__price-qty">
                <div class="cart__price">R$ ${preco.toFixed(2)}</div>
                <div class="cart__qty">
                    <button class="cart__sub" onclick="alterarQuantidade(this, -1)">
                        <span class="material-symbols-outlined">remove</span>
                    </button>
                    <p id="quantity">1</p>
                    <button class="cart__add" onclick="alterarQuantidade(this, 1)">
                        <span class="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    carrinhoMain.appendChild(carrinhoItem);

    // Atualizar a quantidade de itens no carrinho
    updateCartItemCount();

    // Atualizar o valor total do carrinho
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    let totalPrice = parseFloat(cartTotalPrice.textContent.replace('R$', '').replace(',', '.')) || 0;
    totalPrice += preco;
    cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Adicionar eventos aos botões "Comprar"
document.addEventListener('DOMContentLoaded', async () => {
    const filmes = await fetchFilmes();
    const filmesContainer = document.getElementById('filmesContainer');

    filmes.forEach(filme => {
        const filmeElement = document.createElement('div');
        filmeElement.classList.add('opcoes__item');
        filmeElement.innerHTML = `
            <img src="${filme.imagem}" alt="${filme.nome}" class="opcoes__image">
            <h3 class="opcoes__title">${filme.nome}</h3>
            <p class="opcoes__geres"><span>Gênero:</span>${filme.genero}</p>
            <p class="opcoes__year">${filme.ano}</p>
            <p class="opcoes__price">R$ ${filme.preco.toFixed(2)}</p>
            <button onclick="comprarIngresso(${filme.id})">Comprar</button>
        `;
        filmesContainer.appendChild(filmeElement);
    });
});

document.getElementById('shoppingCartIcon').addEventListener('click', function() {
    var carrinho = document.getElementById('carrinho');
    var carrossel = document.getElementById('carrossel');

    if (carrinho.classList.contains('visible')) {
        carrinho.classList.remove('visible');
        carrossel.classList.remove('reduced');
    } else {
        carrinho.classList.add('visible');
        carrossel.classList.add('reduced');
    }
});

function alterarQuantidade(button, delta) {
    const qtySpan = button.parentElement.querySelector('p');
    let qty = parseInt(qtySpan.textContent) + delta;
    if (qty < 1) {
        removerItem(button);
        return;
    }
    qtySpan.textContent = qty;

    const precoElement = button.closest('.cart__item').querySelector('.cart__price');
    const preco = parseFloat(precoElement.textContent.replace('R$', '').replace(',', '.')) || 0;
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    let totalPrice = parseFloat(cartTotalPrice.textContent.replace('R$', '').replace(',', '.')) || 0;

    totalPrice += delta * preco;
    if (totalPrice < 0) totalPrice = 0;
    cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

    // Atualizar a quantidade de itens no carrinho
    updateCartItemCount();

    // Exibir mensagem de "+1" ou "-1"
    const message = document.createElement('div');
    message.classList.add('cart__message');
    message.textContent = delta > 0 ? '+1' : '-1';
    button.parentElement.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1000);
}

function removerItem(button) {
    const item = button.closest('.cart__item');
    const precoElement = item.querySelector('.cart__price');
    const preco = parseFloat(precoElement.textContent.replace('R$', '').replace(',', '.')) || 0;
    const qtySpan = item.querySelector('.cart__qty p');
    const qty = parseInt(qtySpan.textContent) || 0;
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    let totalPrice = parseFloat(cartTotalPrice.textContent.replace('R$', '').replace(',', '.')) || 0;

    totalPrice -= qty * preco;
    if (totalPrice < 0) totalPrice = 0;
    cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

    item.remove();

    // Atualizar a quantidade de itens no carrinho
    updateCartItemCount();
}

function updateCartItemCount() {
    const cartItems = document.querySelectorAll('.cart__item');
    const itemCount = Array.from(cartItems).reduce((count, item) => {
        const qty = parseInt(item.querySelector('.cart__qty p').textContent) || 0;
        return count + qty;
    }, 0);
    const cartItemCount = document.getElementById('cartItemCount');
    cartItemCount.textContent = `Seu carrinho tem ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
}

document.getElementById('shoppingCartIcon').addEventListener('click', () => {
    toggleCart();
    updateCartItemCount();
});

function toggleCart() {
    const carrinho = document.getElementById('carrinho');
    const carrossel = document.getElementById('carrossel');

    if (carrinho.classList.contains('visible')) {
        carrinho.classList.remove('visible');
        carrossel.classList.remove('reduced');
    } else {
        carrinho.classList.add('visible');
        carrossel.classList.add('reduced');
    }
}