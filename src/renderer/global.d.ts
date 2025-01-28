import { AiotTypes } from "@interface/model/aiots"
import { ControleTypes } from "@interface/model/controle"
import { EntityTypes } from "@interface/model/index"
import { OrganismeDeControleTypes } from "@interface/model/organismes-de-controle"
import { ServiceTypes } from "@interface/model/services"
import { SerChunkQuery } from "@interface/query"
import {Crud} from "@interface/types"
import { ICimAPI } from "src/interface/bridge"
  
declare global {
  interface Window {
    cim: ICimAPI
  }
}