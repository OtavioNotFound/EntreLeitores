import { Component } from 'react';
import { ErrorOutlineRounded as ErrorIcon } from '@mui/icons-material';

export default class PageErrorBoundary extends Component{
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){console.error('Falha ao abrir página',error,info);}
  render(){
    if(!this.state.error)return this.props.children;
    return <section className="pagina ativa pagina-erro" role="alert"><ErrorIcon/><h1>Esta página não carregou</h1><p>O aplicativo pode ter recebido uma atualização enquanto estava aberto. Seus dados continuam seguros.</p><div><button className="btn-primario" onClick={()=>window.location.reload()}>Atualizar aplicativo</button><button className="btn-secundario" onClick={()=>{window.location.hash='/inicio';this.setState({error:null});}}>Voltar ao início</button></div></section>;
  }
}
