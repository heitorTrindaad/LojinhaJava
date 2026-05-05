package org.example.demon.io.usuarioModule;

import org.example.demon.io.commonModule.enums.TipoUsuario;

public class UsuarioDtoExit {
    private String nome;
    private String email;
    private TipoUsuario tipo;

    public UsuarioDtoExit() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public TipoUsuario getTipo() {
        return tipo;
    }

    public void setTipo(TipoUsuario tipo) {
        this.tipo = tipo;
    }

}
