<?php
// Dados do banco
$servername = "localhost";
$username = "root"; // usuário do MySQL
$password = "";     // senha do MySQL
$dbname = "agenda"; // nome do banco de dados sem .sql

// Conectar ao banco
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Pegar dados do formulário
$cliente = $_POST['cliente'];
$servico = $_POST['servico'];
$valor   = $_POST['valor'];
$data    = $_POST['data'];
$hora    = $_POST['hora'];

// Inserir no banco
$sql = "INSERT INTO agendamentos (cliente, servico, valor, data, hora) 
        VALUES ('$cliente', '$servico', $valor, '$data', '$hora')";

if ($conn->query($sql) === TRUE) {
    // Redireciona para a página de agendamentos
    header("Location: agendamento.html");
    exit;
} else {
    echo "Erro ao agendar: " . $conn->error;
}

$conn->close();
?>
