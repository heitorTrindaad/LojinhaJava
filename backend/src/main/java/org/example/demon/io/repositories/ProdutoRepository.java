package org.example.demon.io.produtoModule;

import java.util.List;

import org.example.demon.io.models.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    List<Produto> findByVendedorEmail(String email);
}
