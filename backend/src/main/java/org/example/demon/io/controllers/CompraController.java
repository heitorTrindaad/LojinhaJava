package org.example.demon.io.compraModule;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compras")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @PostMapping("/finalizar")
    public ResponseEntity<String> finalizar(@RequestBody List<Integer> produtosIds) {
        try {
            compraService.finalizarCompra(produtosIds);
            return ResponseEntity.ok("Compra realizada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}