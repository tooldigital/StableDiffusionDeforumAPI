import {
  ChakraProvider,
  Heading,
  Container,
  Text,
  Input,
  Button,
  Stack,
  Spinner,
  Select,
  Textarea,
  Checkbox,
  textDecoration
} from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
} from "@chakra-ui/form-control"

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

import {
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { SimpleGrid } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'

import axios from "axios";
import { useState } from "react";

const App = () => {

  const [video, updateVideo] = useState('');
  const [timings, updateTimings] = useState('0,60,120,180,240');
  const [prompt, updatePrompt] = useState('"a man walking on a mountain. trending on artstation.","a cabin on a mountain , trending on artstation.","a man in front of a cabin, trending on artstation.","a man standing in a pool,  trending on artstation."');
  const [selected_model, updateSelectedModel] = useState("Protogen_V2.2.ckpt");
  const [selected_scheduler, updateSelectedScheduler] = useState("dpmpp_2s_a");
  const [guidance, updateGuidance] = useState(7.5);
  const [seed, updateSeed] = useState("iter");
  const [steps, updateSteps] = useState(25);
  const [cadance, updateCadance] = useState(6);
  const [fps, updateFPS] = useState(12);
  const [loading, updateLoading] = useState(false);
  const [error, updateError] = useState(false);
  const [errorMessage, updateErrorMessage] = useState("error");
  const [timetaken, updateTimeTaken] = useState("");

  
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


  const parse = (val) => val.replace(/^\$/, '')

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  const checkError = () => {

    var result = false;
    //check time and prompts numbers
     let resb = prompt.replace(/(^[ \t]*\n)/gm, "")
    var arrStr = resb.split(/["""]/);
    for (let i=0;i<arrStr.length;i++) {
      if(arrStr[i] == "" || arrStr[i]==',' || arrStr[i]=='\n' || arrStr[i]==',\n' || arrStr[i]=='\n,') {
        arrStr.splice(i,1)
      }
    }
    var plength = arrStr.length;
    var tarr = timings.split(/[","]/).length;
    var tarrr = timings.split(/[","]/);
    var pliple = false;
    for (var i=0;i<tarr;i++) {

      let t = parseInt(tarrr[i]);
      if (!isNumber(t) ) {
        pliple = true;
     }
    }
    if (pliple) {
      updateErrorMessage("only integers in time");
      result=true;
    } else if (plength != tarr-1) {
      updateErrorMessage("timing and prompt lenght not correct");
      result=true;
    } else if (!prompt) {
      updateErrorMessage("no prompt defined");
      result = true;
    } else if (!selected_model) {
      updateErrorMessage("no model defined");
      result = true;
    } else if (!selected_scheduler) {
      updateErrorMessage("no scheduler defined");
      result = true;
    } else if (!guidance) {
      updateErrorMessage("no guidance");
      result = true;
    } else if (!steps) {
      updateErrorMessage("no steps");
      result = true;
    } else if (!seed) {
      updateErrorMessage("no seed");
      result = true;
    }
    return result;
  }

  const generate = async (prompt) => {
    if (checkError()) {
      updateError(true);
    } else {
      updateError(false);
      updateLoading(true);
      const config = {
        headers:{
          "ngrok-skip-browser-warning": "69420"
        }
      };
      updateTimeTaken("");
      let start = Date.now();
      const result = await axios.get(`http://localhost/generatevideo?prompt=${prompt}&timings=${timings}&steps=${steps}&seed=${seed}&guidance=${guidance}&scheduler=${selected_scheduler}&selected_model=${selected_model}&cadance=${cadance}&fps=${fps}`,config);
      updateVideo('http://localhost/static/'+result.data);
      let ttimeTaken = Date.now() - start;
      updateTimeTaken(millisToMinutesAndSeconds(ttimeTaken))
      updateLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Container maxW='1080px'>
        <Heading>Tool of North America - Stable Diffusion Animation 🚀</Heading>

        <Box marginTop={"10px"} marginBottom={"10px"} bg='black' color='white' p={4} borderWidth='1px' borderRadius='lg' >DEFORUM</Box>

        <Text marginBottom={"10px"}>When using custom model, include this prefix in the prompt</Text>
        <UnorderedList marginBottom={"30px"}>
          <ListItem>ultimate-country: <b>ultmtcntry</b></ListItem>
        </UnorderedList>

          <Text>Prompts</Text>
          <Textarea  placeholder='' value={prompt} onChange={(e) => updatePrompt(e.target.value)}></Textarea>
         
          <Text>Timings</Text>
          <Input  placeholder='' value={timings} onChange={(e) => updateTimings(e.target.value)}></Input>

          <FormControl>
            <FormLabel>Model</FormLabel>
            <Select placeholder='' value={selected_model} onChange={(e) => updateSelectedModel(e.target.value)} >
              <option>Protogen_V2.2.ckpt</option>
              <option>ultimate-country-photo-v3.ckpt</option>
              <option>ultimate-country-texture-v2.ckpt</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Scheduler</FormLabel>
            <Select placeholder='' value={selected_scheduler} onChange={(e) => updateSelectedScheduler(e.target.value)} >
              <option>dpmpp_2s_a</option>
              <option>euler</option>
              <option>ddim</option>
              <option>dpmpp_2m</option>
              <option>EulerAncestralDiscreteScheduler</option>
              <option>DPMSolverMultistepScheduler</option>
            </Select>
          </FormControl>
    
        <SimpleGrid marginBottom={"10px"} columns={5} spacing={0}>
          <Text>Guidance:</Text>
          <Text>Steps:</Text>
          <Text>Seed:</Text>
          <Text>Cadence:</Text>
          <Text>FPS:</Text>
          <NumberInput value={guidance} precision={2} step={0.1} onChange={(valueString) => updateGuidance(parse(valueString))} ><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
          <NumberInput value={steps} precision={0} step={1} onChange={(valueString) => updateSteps(parse(valueString))} ><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
          <Select placeholder='' value={seed} onChange={(e) => updateSeed(e.target.value)} >
              <option>iter</option>
              <option>fixed</option>
              <option>random</option>
              <option>ladder</option>
              <option>alternate</option>
            </Select>
          
          <NumberInput value={cadance} precision={0} step={1} min={1} max={8} onChange={(valueString) => updateCadance(parse(valueString))}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
          <NumberInput value={fps} precision={0} step={1} min={1} onChange={(valueString) => updateFPS(parse(valueString))}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
    
        </SimpleGrid>

        <Button onClick={(e) => generate(prompt)} marginBottom={"50px"} >Generate</Button>

        {timetaken ? null:(<Text marginBottom={"50px"}>{timetaken}</Text>)}

        {error ? (<Box marginTop={"10px"} marginBottom={"10px"} bg='black' color='white' p={4} borderWidth='1px' borderRadius='lg' >ERROR: {errorMessage}</Box>) : null}

        {loading ? (<Stack><Spinner marginBottom={"50px"} size='xl' /></Stack>) :  video ? (<Box marginBottom={"50px"} as='video' controls src={video} poster='https://cdn.8thwall.com/web/accounts/icons/50z1f4gsobku6ce5aer2xb87wirfmecatq1raz6ttnj0t7cmwi31zupd-400x400' alt='video' objectFit='contain' sx={{aspectRatio: '1/1'}}/>) : null}

      </Container>
    </ChakraProvider>
  );
};

export default App;