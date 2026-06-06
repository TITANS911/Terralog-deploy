import java.sql.*;
String url = "jdbc:mysql://localhost:3306/terralog";
String user = "root";
String pass = "";
try (Connection c = DriverManager.getConnection(url, user, pass)) {
  System.out.println("CONNECTED");
  DatabaseMetaData m = c.getMetaData();
  try (ResultSet rs = m.getTables(null, null, "kategori", new String[]{"TABLE"})) {
    while (rs.next()) {
      System.out.println("TABLE=" + rs.getString("TABLE_NAME"));
    }
  }
  try (ResultSet rs = m.getColumns(null, null, "kategori", null)) {
    while (rs.next()) {
      System.out.println(rs.getString("COLUMN_NAME") + " " + rs.getString("TYPE_NAME") + " " + rs.getString("COLUMN_SIZE") + " auto=" + rs.getString("IS_AUTOINCREMENT") + " null=" + rs.getString("IS_NULLABLE") + " def=" + rs.getString("COLUMN_DEF"));
    }
  }
} catch (Exception e) {
  e.printStackTrace();
}
