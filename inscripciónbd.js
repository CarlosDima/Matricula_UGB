var db_sistema = openDatabase('dbsistema', '1.0', 'Sistema de Facturacion', 5 * 1024 * 1024);
if(!db_sistema){
    alert('Lo siento tu navegado NO soporta BD locales.');
}
var app = new Vue({
    el: '#appInscripcion',
    data: {
        materias: [],
        buscar: '',
        materia: {
            accion: 'nuevo',
            msg : '',
            IdMateria: '',
            codigo: '',
            materia1: '',
            materia2: '',
            materia3: '',
            materia4: '',
            materia5: ''       
        },
    },
    methods: {
        buscarMateria(){
            if( this.buscar.trim().length>0 ){
                this.materias = this.materias.filter(item=>item.codigo.toLowerCase().indexOf(this.buscar.toLowerCase())>=0);
            } else {
                this.obtenerMaterias();
            }
            this.obtenerMaterias(this.buscar);
        },
        guardarMateria(){
            let sql = '',
                parametros = [];
            if(this.materia.accion == 'nuevo'){
                sql = 'INSERT INTO materias (codigo, materia1, materia2, materia3, materia4, materia5) VALUES (?,?,?,?,?,?)';
                parametros = [this.materia.codigo,this.materia.materia1,this.materia.materia2,this.materia.materia3,this.materia.materia4,this.materia.materia5];
            }else if(this.materia.accion == 'modificar'){
                sql = 'UPDATE materias SET codigo=?, materia1e=?, materia2=?, materia3=?, materia4=?, materia5=? WHERE idMateria=?';
                parametros = [this.materia.codigo,this.materia.materia1,this.materia.materia2,this.materia.materia3,this.materia.materia4,this.materia.materia5];
            }else if(this.materia.accion == 'eliminar'){
                sql = 'DELETE FROM materias WHERE idMateria=?';
                parametros = [this.materia.idMateria];
            }
            db_sistema.transaction(tx=>{
                tx.executeSql(sql,
                    parametros,
                (tx, results)=>{
                    this.materia.msg = 'Inscripcion procesado con exito';
                    this.nuevoMateria();
                    this.obtenerMaterias();
                },
                (tx, error)=>{
                    this.materia.msg = `Error al guardar la Incripcion ${error.message}`;
                });
            });
        },
        modificarMateria(materia){
            this.materia = materia;
            this.materia.accion = 'modificar';
        },
        eliminarMateria(materia){
            if( confirm(`¿Esta seguro de eliminar la Inscripcion ${materia.codigo}?`) ){
                this.materia.idMateria= materia.idMateria;
                this.materia.accion = 'eliminar';
                this.guardarMateria();
            }
        },
        obtenerMaterias(busqueda=''){
            db_sistema.transaction(tx=>{
                tx.executeSql(`SELECT * FROM alumnos WHERE nombre like "%${busqueda}%" OR codigo like "%${busqueda}%"`, [], (tx, results)=>{
                    this.materias = results.rows;
                    this.materias = [];
                    for(let i=0; i<results.rows.length; i++){
                        this.materias.push(results.rows.item(i));
                    }
                });
            });
        },
        nuevoMateria(){
            this.materia.accion = 'nuevo';
            this.materia.idMateria = '';
            this.materia.codigo = '';
            this.materia.materia1 = '';
            this.materia.materia2 = '';
            this.materia.materia3 = '';
            this.materia.materia4 = '';
            this.materia.materia5 = '';
        }
    },
    created(){
        db_sistema.transaction(tx=>{
            tx.executeSql('CREATE TABLE IF NOT EXISTS alumnos(idMateria INTEGER PRIMARY KEY AUTOINCREMENT, '+
                'codigo char(10), materia1 TEXT, materia2 TEXT, materia3 TEXT, materia4 TEXT, materia5 TEXT)');
        }, err=>{
            console.log('Error al crear la tabla Materias', err);
        });
        this.obtenerMaterias();
    }
});
