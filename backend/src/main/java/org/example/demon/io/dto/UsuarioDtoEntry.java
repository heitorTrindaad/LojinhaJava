package org.example.demon.io.usuarioModule;

import org.example.demon.io.commonModule.enums.TipoUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioDtoEntry {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String email;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$", message = "Telefone inválido. Use (XX) 9XXXX-XXXX")
    private String telefone;

    private TipoUsuario tipo;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    public UsuarioDtoEntry() {}

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}