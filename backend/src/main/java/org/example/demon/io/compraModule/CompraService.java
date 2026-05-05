package org.example.demon.io.compraModule;

import java.util.List;
import org.example.demon.io.models.Compra;
import org.example.demon.io.models.Produto;
import org.example.demon.io.models.Usuario;
import org.example.demon.io.produtoModule.ProdutoRepository;
import org.example.demon.io.usuarioModule.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompraService {
    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Transactional
public void finalizarCompra(List<Integer> produtosIds) {
    String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario comprador = usuarioService.buscarPorEmail(emailLogado);

    List<Produto> produtosParaComprar = produtoRepository.findAllById(produtosIds);

    for (Produto produto : produtosParaComprar) {
        if (produto.getEstoque() <= 0) {
            throw new RuntimeException("O produto " + produto.getNome() + " está esgotado!");
        }
        produto.setEstoque(produto.getEstoque() - 1); 
    }

    Compra compra = new Compra();
    compra.setComprador(comprador);
    compra.setProdutos(produtosParaComprar);
    compraRepository.save(compra);
}
}