import React from 'react'

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {parsePDB} from './mgMiniMol.js';

const Spacer = props => {
  return (
    <div style={{height:props.height}}></div>
  );
}

class PDB_REDO extends React.Component {
    constructor(props){
        super(props);
        this.state = { searchString: "", searchType:"full_coords"};
    }

    submitHandler (e) {
        e.preventDefault();
        this.handleSubmit();
    }

    getPDBREDO(){

        const pdbCode = this.state.searchString.toLowerCase();
        let theUrl = "";
        let name = "";
        let blob = false;
        if(this.state.searchType==="full_coords") {
            theUrl = "https://pdb-redo.eu/db/"+pdbCode+"/"+pdbCode+"_final.pdb";
            name = pdbCode+"_final.pdb";
        } else if(this.state.searchType==="full_mtz") {
            theUrl = "https://pdb-redo.eu/db/"+pdbCode+"/"+pdbCode+"_final.mtz";
            blob = true;
        } else if(this.state.searchType==="partial_coords") {
            theUrl = "https://pdb-redo.eu/db/"+pdbCode+"/"+pdbCode+"_besttls.pdb";
            name = pdbCode+"_besttls.pdb";
        } else if(this.state.searchType==="partial_mtz") {
            theUrl = "https://pdb-redo.eu/db/"+pdbCode+"/"+pdbCode+"_besttls.mtz";
            blob = true;
        }

        fetch(theUrl).then(response => {
            if(blob){
                return response.blob();
            } else {
                return response.text();
            }
         }).then(data => {
            if(blob){
            new Response(data).arrayBuffer()
            .then(arrayBuffer => {
                var byteArray = new Uint8Array(arrayBuffer);
                console.log(byteArray);
                // TODO - now load it...
            });
            } else {
                const dataSplit = data.split("\n");
                const pdbatoms = parsePDB(dataSplit,name);
                const pending = {fileData:data,atoms:pdbatoms,wizard:"Bonds",name:name};
                this.props.onPDBChange(pending);
            }
        }).catch(error => {
            console.error(error);
        });

    }

    handleSubmit(){
        this.getPDBREDO();
    }

    selectionChanged(evt) {
        this.setState({ searchType:evt.target.value });
    }

    handeleSearchChange(e){
        this.setState({searchString: e.target.value});
    }

    render() {
        const selectionChanged = this.selectionChanged.bind(this);
        return (
        <>
        <Form onSubmit={this.submitHandler.bind(this)} >
        <Spacer height="1rem" />
        <Form.Select aria-label="PDB_REDO Select" onChange={selectionChanged}>
            <option value="full_coords">Fully optimized coordinates</option>
            <option value="full_mtz">Fully optimized MTZ</option>
            <option value="partial_coords">Conservatively optimized coordinates</option>
            <option value="partial_mtz">Conservatively optimized MTZ</option>
        </Form.Select>
        <Spacer height="1rem" />
        <Form.Group as={Row} controlId="getpdbredo">
        <Col>
        <Form.Control type="text" onChange={this.handeleSearchChange.bind(this)} placeholder="Search string" value={this.state.searchString} />
        </Col>
        <Col>
        <Button onClick={this.getPDBREDO.bind(this)}>Get Data</Button>
        </Col>
        </Form.Group>
        </Form>
        </>
        )
    }
}
export default PDB_REDO;

