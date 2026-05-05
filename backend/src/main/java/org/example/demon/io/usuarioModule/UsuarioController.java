package org.example.demon.io.usuarioModule;

import org.example.demon.io.commonModule.LoginDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrar(@Valid @RequestBody UsuarioDtoEntry dto) {
        try {
            usuarioService.salvar(dto);
            return ResponseEntity.status(201).body("Usuário cadastrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDto dto) {
        try {
            usuarioService.verificarLogin(dto);
            return ResponseEntity.ok("Autenticado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removerUsuario(@RequestBody LoginDto dto) {
        try {
            usuarioService.deletar(dto);
            return ResponseEntity.ok("Usuário removido com sucesso!");
        } catch (SecurityException e) {
            // Retorna 403 Forbidden para erros de permissão
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/desativar")
    public ResponseEntity<String> desativarConta(@RequestBody LoginDto dto) {
        try {
            usuarioService.deletar(dto);
            return ResponseEntity.ok("Conta desativada.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}