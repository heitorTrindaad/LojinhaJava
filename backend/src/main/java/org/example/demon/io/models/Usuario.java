package org.example.demon.io.models;

import java.util.ArrayList;
import java.util.List;

import org.example.demon.io.commonModule.enums.TipoUsuario;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nome;
    @Column(unique = true, nullable = false)
    private String email;
    private String senha;
    private String telefone; // ADICIONADO: Campo Telefone

    private boolean ativo = true;

    @Enumerated(EnumType.STRING)
    private TipoUsuario tipo;

    @JsonManagedReference
    @OneToMany(mappedBy = "comprador", cascade = CascadeType.ALL)
    private List<Compra> compras = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "vendedor", cascade = CascadeType.ALL)
    private List<Produto> produtosVendendo = new ArrayList<>();

    public Usuario() {}

    // Getters e Setters (Mantendo os outros e adicionando o novo)
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}