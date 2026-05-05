package org.example.demon.io.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "compra")
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "comprador_id", referencedColumnName = "id")
    private Usuario comprador;

    @JsonManagedReference
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL)
    private List<Produto> produtos = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL)
    private List<FormaDePagamento> formapgmt = new ArrayList<>();

    public Compra(Usuario comprador, List<Produto> produtos) {
        this.comprador = comprador;
        this.produtos = produtos;
    }

    public Compra() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Usuario getComprador() {
        return comprador;
    }

    public void setComprador(Usuario comprador) {
        this.comprador = comprador;
    }

    public List<Produto> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<Produto> produtos) {
        this.produtos = produtos;
    }

    public List<FormaDePagamento> getFormapgmt() {
        return formapgmt;
    }

    public void setFormapgmt(List<FormaDePagamento> formapgmt) {
        this.formapgmt = formapgmt;
    }

}