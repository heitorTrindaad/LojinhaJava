package org.example.demon.io.produtoModule;

import java.util.List;

import org.example.demon.io.commonModule.LoginDto;
import org.example.demon.io.models.Produto;
import org.example.demon.io.models.Usuario;
import org.example.demon.io.usuarioModule.UsuarioRepository;
import org.example.demon.io.usuarioModule.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ProdutoService {
    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    // depois de adicionar buscas no UsuarioService, trocar aqui para parar de
    // acessar o UsuarioRepository
    public void criarProduto(ProdutoDto dto) {
        String emailLogado = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Usuario vendedor = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado!"));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setVendedor(vendedor);
        produtoRepository.save(produto);
    }

    public void deletarProdutoCorrigido(int id, String senha) {
    String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
    Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produto Não Encontrado"));

    if (!produto.getVendedor().getEmail().equals(emailLogado)) {
        throw new RuntimeException("VOCÊ NÃO TEM PERMISSÃO DE EXCLUIR PRODUTO DE OUTRA PESSOA");
    }

    

    // Mantendo sua lógica de re-autenticação antes de deletar
    LoginDto loginDto = new LoginDto();
    loginDto.setEmail(emailLogado);
    loginDto.setSenha(senha);
    usuarioService.verificarLogin(loginDto);

    produtoRepository.delete(produto);
}

    public List<Produto> buscarTodos() {
        return produtoRepository.findAll();
    }

    public List<Produto> buscarMeusProdutos() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        return produtoRepository.findByVendedorEmail(emailLogado);
    }

    @Transactional
    public void atualizarNome(LoginDto dto, int id, String novoNome) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto Não Encontrado"));

        if (!produto.getVendedor().getEmail().equals(emailLogado) || !dto.getEmail().equals(emailLogado)) {
            throw new RuntimeException("VOCÊ NÃO TEM PERMISSÃO DE ALTERAR PRODUTO DE OUTRA PESSOA");
        }

        if (novoNome == null || novoNome.trim().isEmpty()) {
            throw new RuntimeException("O novo nome não pode estar vazio.");
        }

        usuarioService.verificarLogin(dto);
        produto.setNome(novoNome);
        produtoRepository.save(produto);

    }
}
