package org.example.demon.io.compraModule;

import org.example.demon.io.models.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
}

// Saporra é fantasma, não atualiza com nada