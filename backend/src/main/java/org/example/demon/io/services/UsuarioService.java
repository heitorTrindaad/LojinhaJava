package org.example.demon.io.usuarioModule;

import org.example.demon.io.commonModule.LoginDto;
import org.example.demon.io.commonModule.enums.TipoUsuario;
import org.example.demon.io.models.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void salvar(UsuarioDtoEntry dto) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Este e-mail já está sendo utilizado!");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());
        usuario.setTipo(dto.getTipo());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        
        usuarioRepository.save(usuario);
    }

    public void verificarLogin(LoginDto dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        if (!usuario.isAtivo()) {
            throw new RuntimeException("Esta conta foi desativada.");
        }

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Senha incorreta!");
        }
    }

    public void remover(int id) {
        // 1. Pega o e-mail de quem está logado no sistema
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Usuario logado = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado"));

        Usuario alvo = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário a ser removido não encontrado"));

        // 2. Lógica de Permissão: ADMIN ou se o logado for o dono da conta
        if (logado.getTipo() == TipoUsuario.ADMIN || logado.getEmail().equals(alvo.getEmail())) {
            usuarioRepository.delete(alvo);
        } else {
            // Lançamos uma exceção específica para o Controller capturar como 403
            throw new SecurityException("ACESSO NEGADO: Você não tem permissão para remover este usuário.");
        }
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário inexistente: " + email));
    }

    public void deletar(LoginDto dto) {
        verificarLogin(dto);
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail()).get();
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
}