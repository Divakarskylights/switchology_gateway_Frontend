import { gql } from 'graphql-request';


// working
const INSERT_PROFILE_DATA = gql`
mutation CreateProfile($input: CreateProfileInput!) {
  createProfile(input: $input) {
    profile {
      email
      gatewayName
      name
      orgname
      adminPassword
      viewerPassword
      userid
      buildingName
      address
    }
  }
}
`;


//working
const INSERT_METER_DATA = gql`
  mutation CreateReportdatum($input: CreateReportdatumInput!) {
    createReportdatum(input: $input) {
      reportdatum {
        firstMeter
        tariff
        bescomBill
      }
    }
  }
`;



const INSERT_AUTH = gql`
  mutation CreateAuth($input: CreateAuthInput!) {
    createAuth(input: $input) {
      auth {
        authVerified
      }
    }
  }
`;



const GET_PROFILE_DATA = gql`
query GetProfiles {
  allProfiles {
    nodes {
      nodeId
      createTime
      email
      gatewayName
      orgname
      name
      adminPassword
      viewerPassword
      userid
      buildingName
      address
    }
  }
}
`;


// working
const INSERT_METER_INFO = gql`
mutation CreateMeterConfigration($input: CreateMeterConfigrationInput!) {
  createMeterConfigration(input: $input) {
    meterConfigration {
      con
      label
      device
      meterName
      meterModel
      meterNo
      meterType
      meterMake
      interval
    }
  }
}
`;


const UPDATE_METER_INFO = gql`
mutation UpdateMeterConfigration($input: UpdateMeterConfigrationInput!) {
  updateMeterConfigration(input: $input) {
    meterConfigration {
      con
      label
      device
      meterName
      meterModel
      meterNo
      meterType
      meterMake
      interval
    }
  }
}
`;



const DELETE_METER_INFO = gql`
  mutation DeleteMeterById($input: DeleteMeterConfigrationByIdInput!) {
    deleteMeterConfigrationById(input: $input) {
      meterConfigration {
        id
        meterNo
      }
    }
  }
`;




const GET_METER_INFO = gql`
query GetMeterConfigurations {
  allMeterConfigrations(orderBy: METER_NO_ASC) {
    nodes {
      id
      meterNo
      label
      meterMake
      meterModel
      meterName
      meterType
      interval
      con
      device
    }
  }
}
`;



const UPDATE_METER_INTERVAL = gql`
  mutation UpdateMeterConfigrationById($input: UpdateMeterConfigrationByIdInput!) {
    updateMeterConfigrationById(input: $input) {
      meterConfigration {
        id
        interval
      }
    }
  }
`;



const UPDATE_PROFILE = gql`
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    profile {
      userid
      adminPassword
      viewerPassword
      email
      gatewayName
      name
      orgname
      buildingName
      address
    }
  }
}
`;




const UPDATE_PROFILE_BY_USERID = gql`
mutation UpdateProfileByUserid($input: UpdateProfileByUseridInput!) {
  updateProfileByUserid(input: $input) {
    profile {
      userid
      adminPassword
      viewerPassword
      email
      gatewayName
      name
      orgname
      buildingName
      address
    }
  }
}
`;




const UPDATE_PASSWORD = gql`
mutation UpdatePassword($input: UpdatePasswordInput!) {
  updatePassword(input: $input) {
    profile {
      adminPassword
      viewerPassword
    }
  }
}
`;



const UPDATE_FORGOT_PASSWORD = gql`
  mutation UpdateForgotPassword($input: UpdateForgotPasswordInput!) {
    updateForgotPassword(input: $input) {
      profile {
        createTime
        email
        orgname
        name
        gatewayName
        adminPassword
        viewerPassword
        userid
      }
    }
  }
`;

const GET_RELAY_STATUS = gql`
  query GetRelayStatus {
    relayStatuses(orderBy: CREATED_AT_DESC, first: 1) {
      id
      ipStatus1
      ipStatus2
      ipStatus3
      ipStatus4
      ipStatus5
      ipStatus6
      ipStatus7
      ipStatus8
      opStatus1
      opStatus2
      opStatus3
      opStatus4
      opStatus5
      opStatus6
      opStatus7
      opStatus8
      createdAt
    }
  }
`;





const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

const GET_AUTH = gql`
  query GetAuth {
    allAuths {
      nodes {
        authVerified
      }
    }
  }
`;


const GET_REPORTDATA = gql`
  query GetAllReportData {
    allReportdata {
      nodes {
        id
        firstMeter
        tariff
        bescomBill
        createdAt
        ebPresent
        ebPrevious
        dgPresent
        dgPrevious
        updatedAt
      }
    }
  }
`;


// working
const INSERT_JSON_DATA = gql`
  mutation CreateGeneratedJsonData($input: CreateGeneratedJsonDatumInput!) {
    createGeneratedJsonDatum(input: $input) {
      generatedJsonDatum {
        jsonData
        dateAndTime
        meterId
      }
    }
  }
`;

const UPDATE_JSON_DATA = gql`
  mutation UpdateGeneratedJsonDatum($input: UpdateGeneratedJsonDatumInput!) {
    updateGeneratedJsonDatum(input: $input) {
      generatedJsonDatum {
        id
        meterId
        jsonData
        dateAndTime
      }
    }
  }
`;



const GET_ALL_GENERATED_JSON_DATA = gql`
  query GetAllGeneratedJsonData {
    allGeneratedJsonData {
      nodes {
        id
        nodeId
        meterId
        jsonData
        dateAndTime
      }
    }
  }
`;

const GET_JSON_DATA = gql`
  query GetGeneratedJsonData($nodeId: ID!) {
    generatedJsonDatum(nodeId: $nodeId) {
      dateAndTime
      jsonData
      meterId
    }
  }
`;



const DELETE_JSON_DATA = gql`
  mutation DeleteGeneratedJsonData($input: DeleteGeneratedJsonDataInput!) {
    deleteGeneratedJsonData(input: $input) {
      generatedJsonDatum {
        meterId
      }
    }
  }
`;




const UPDATE_REPORTDATA = gql`
  mutation UpdateReportdatumById($input: UpdateReportdatumByIdInput!) {
    updateReportdatumById(input: $input) {
      reportdatum {
        firstMeter
        tariff
        bescomBill
        updatedAt
      }
    }
  }
`;




const DELETE_REPORTDATA = gql`
  mutation DeleteReportdatumById($input: DeleteReportdatumByIdInput!) {
    deleteReportdatumById(input: $input) {
      reportdatum {
        firstMeter
        tariff
        bescomBill
        updatedAt
      }
    }
  }
`;





// working
const INSERT_TARIFFS = gql`
  mutation CreateTariff($input: CreateTariffInput!) {
    createTariff(input: $input) {
      tariff {
        tariffName
        demandChargesRsKva
        energyChargesRsKwh
        fuelCostAdjRsKwh
        interestOnRevenue
        interestOnTax
        percentOfCdKva
        taxPercent
        createdDate
        updatedDate
        id
      }
    }
  }
`;




// working
const GET_TARIFFS = gql`
  query GetTariffs {
    allTariffs(orderBy: CREATED_DATE_DESC) {
      nodes {
        id
        tariffName
        percentOfCdKva
        demandChargesRsKva
        energyChargesRsKwh
        fuelCostAdjRsKwh
        interestOnRevenue
        interestOnTax
        taxPercent
        createdDate
        updatedDate
      }
    }
  }
`;


// working
const UPDATE_TARIFFS = gql`
  mutation UpdateTariffById($input: UpdateTariffByIdInput!) {
    updateTariffById(input: $input) {
      tariff {
        id
        tariffName
      }
    }
  }
`;


const DELETE_TARIFFS = gql`
  mutation DeleteTariffById($input: DeleteTariffByIdInput!) {
    deleteTariffById(input: $input) {
      tariff {
        id
      }
    }
  }
`;


// --------------- DEVICE CRUD QUERIES ---------------

const GET_DEVICES = gql`
  query GetDevices {
    devices(orderBy: CREATED_AT_ASC) {
      id
      name
      relayNumber
      inputRelayNumber
      configJson
      createdAt
      updatedAt
    }
  }
`;

const GET_ALL_DEVICES_QUERY = gql`
  query GetAllDevices {
    devices(orderBy: CREATED_AT_ASC) {
      id
      name
      relayNumber
      inputRelayNumber
      configJson
      createdAt
      updatedAt
    }
  }
`;

// working
const INSERT_DEVICE_MUTATION = gql`
  mutation CreateDevice($input: CreateDeviceInput!) {
    createDevice(input: $input) {
      device {
        id
        name
        relayNumber
        inputRelayNumber
      }
    }
  }
`;

const UPDATE_DEVICE_MUTATION = gql`
  mutation UpdateDevice($input: UpdateDeviceInput!) {
    updateDevice(input: $input) {
      device {
        id
        name
        relayNumber
        inputRelayNumber
        configJson
        updatedAt
      }
    }
  }
`;

const DELETE_DEVICE_MUTATION = gql`
  mutation DeleteDevice($input: DeleteDeviceInput!) {
    deleteDevice(input: $input) {
      device {
        id
      }
    }
  }
`;

const DELETE_ALL_DEVICES_MUTATION = gql`
  mutation DeleteAllDevices($input: DeleteAllDevicesInput!) {
    deleteAllDevices(input: $input) {
      devices {
        id
      }
    }
  }
`;

// --------------- AUTOMATION RULES CRUD QUERIES ---------------
const GET_AUTOMATION_RULES = gql`
  query GetAutomationRules {
    automationRules(orderBy: CREATED_AT_ASC) {
      id
      name
      triggerType
      triggerDeviceId
      triggerDeviceLabel
      conditionOperator
      conditionValue
      conditionUnit
      actionType
      actionDeviceId
      actionDeviceLabel
      isEnabled
      updatedAt
    }
  }
`;



const INSERT_AUTOMATION_RULE_MUTATION = gql`
  mutation CreateAutomationRule($input: CreateAutomationRuleInput!) {
    createAutomationRule(input: $input) {
      automationRule {
        id
      }
    }
  }
`;



const UPDATE_AUTOMATION_RULE_MUTATION = gql`
  mutation UpdateAutomationRule($input: UpdateAutomationRuleInput!) {
    updateAutomationRule(input: $input) {
      automationRule {
        id
      }
    }
  }
`;

const DELETE_AUTOMATION_RULE_MUTATION = gql`
  mutation DeleteAutomationRule($input: DeleteAutomationRuleInput!) {
    deleteAutomationRule(input: $input) {
      automationRule {
        id
      }
    }
  }
`;

// --------------- SCHEDULES CRUD QUERIES ---------------
const GET_SCHEDULES = gql`
  query GetSchedules {
    schedules(orderBy: CREATED_AT_ASC) {
      id
      deviceId
      deviceNameLabel
      action
      time
      frequency
      customDays
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

const INSERT_SCHEDULE_MUTATION = gql`
  mutation CreateSchedule($input: CreateScheduleInput!) {
    createSchedule(input: $input) {
      schedule {
        id
      }
    }
  }
`;

const UPDATE_SCHEDULE_MUTATION = gql`
  mutation UpdateSchedule($input: UpdateScheduleInput!) {
    updateSchedule(input: $input) {
      schedule {
        id
      }
    }
  }
`;

const DELETE_SCHEDULE_MUTATION = gql`
  mutation DeleteSchedule($input: DeleteScheduleInput!) {
    deleteSchedule(input: $input) {
      schedule {
        id
      }
    }
  }
`;

// --------------- ACTIVITY LOG QUERIES ---------------

// working
const INSERT_ACTIVITY_LOG_MUTATION = gql`
  mutation CreateActivityLog($input: CreateActivityLogInput!) {
    createActivityLog(input: $input) {
      activityLog {
        id
      }
    }
  }
`;



const GET_ACTIVITY_LOG = gql`
  query GetActivityLog {
    activityLogs(orderBy: TIMESTAMP_DESC, first: 100) {
      id
      timestamp
      source
      itemType
      itemId
      itemName
      action
      details
      userId
    }
  }
`;

// --------------- SCADA DIAGRAM CRUD QUERIES (Single Diagram Focus) ---------------
const SINGLE_SCADA_DIAGRAM_NAME = "default_scada_diagram";

const GET_SINGLE_SCADA_DIAGRAM_MODEL = gql`
  query GetSingleScadaDiagramModel {
    allScadaDiagrams {
      nodes {
        id
        nodeId  # Add this field if available
        name
        description
        diagramModelJson
        createdAt
        updatedAt
      }
    }
  }
`;

// working
const INSERT_SINGLE_SCADA_DIAGRAM = gql`
  mutation CreateScadaDiagram($input: CreateScadaDiagramInput!) {
    createScadaDiagram(input: $input) {
      scadaDiagram {
        id
        name
        description
        diagramModelJson
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_SINGLE_SCADA_DIAGRAM = gql`
  mutation UpdateSingleScadaDiagram($input: UpdateScadaDiagramInput!) {
    updateScadaDiagram(input: $input) {
      scadaDiagram {
        id
        name
        description
        diagramModelJson
        createdAt
        updatedAt
      }
    }
  }
`;


const DELETE_SINGLE_SCADA_DIAGRAM = gql`
  mutation DeleteSingleScadaDiagram($input: DeleteScadaDiagramInput!) {
    deleteScadaDiagram(input: $input) {
      scadaDiagram {
        id
      }
    }
  }
`;

const DELETE_SCADA_DIAGRAM_BY_ID = gql`
  mutation DeleteScadaDiagramById($input: DeleteScadaDiagramByIdInput!) {
    deleteScadaDiagramById(input: $input) {
      scadaDiagram {
        id
      }
    }
  }
`;


// working
const INSERT_KPI = gql`
  mutation CreateKpi($input: CreateKpiInput!) {
    createKpi(input: $input) {
      kpi {
        units
        uid
        values
        parameters
        createdDate
        updatedDate
        added
        combineId
      }
    }
  }
`;


const GET_KPI_DATA = gql`
  query GetKpiData {
    allKpis(orderBy: CREATED_DATE_DESC) {
      nodes {
        uid
        values
        parameters
        units
        createdDate
        updatedDate
        added
        combineId
      }
    }
  }
`;



const DELETE_KPI = gql`
  mutation DeleteKpi($input: DeleteKpiInput!) {
    deleteKpi(input: $input) {
      kpi {
        uid
        parameters
        values
        added
      }
    }
  }
`;



const DELETE_KPI_BY_UID = gql`
  mutation DeleteKpiByUid($input: DeleteKpiByUidInput!) {
    deleteKpiByUid(input: $input) {
      kpi {
        uid
        parameters
        values
        added
      }
    }
  }
`;


const GET_GATEWAYS = gql`
  query GetGateways {
    allGatewaystatuses {
      nodes {
        id
        gatewayName
        gatewayLock
        gatewayType
        lastUpdated
        subscriptionStart
        subscriptionEnd
        subscriptionIsActive
      }
    }
  }
`;

const UPDATE_GATEWAY = gql`
  mutation UpdateGateway($input: UpdateGatewaystatusByIdInput!) {
    updateGatewaystatusById(input: $input) {
      gatewaystatus {
        id
        gatewayName
        gatewayLock
        gatewayType
        lastUpdated
        subscriptionStart
        subscriptionEnd
        subscriptionIsActive
      }
    }
  }
`;
export {
  INSERT_PROFILE_DATA, GET_PROFILE_DATA, INSERT_METER_INFO, UPDATE_METER_INFO, DELETE_METER_INFO, GET_METER_INFO, UPDATE_METER_INTERVAL,
  UPDATE_PROFILE, UPDATE_PROFILE_BY_USERID, UPDATE_PASSWORD, UPDATE_FORGOT_PASSWORD,
  GET_RELAY_STATUS,
  UPDATE_JSON_DATA,
  GET_ALL_GENERATED_JSON_DATA,
  RESET_PASSWORD, INSERT_AUTH, GET_AUTH, INSERT_METER_DATA, GET_REPORTDATA,
  UPDATE_REPORTDATA, DELETE_REPORTDATA, INSERT_JSON_DATA, DELETE_JSON_DATA, GET_JSON_DATA, INSERT_TARIFFS, GET_TARIFFS,
  UPDATE_TARIFFS, DELETE_TARIFFS,
  // Device CRUD
  GET_DEVICES, INSERT_DEVICE_MUTATION, UPDATE_DEVICE_MUTATION, DELETE_DEVICE_MUTATION, GET_ALL_DEVICES_QUERY,
  // Automation Rules CRUD
  GET_AUTOMATION_RULES, INSERT_AUTOMATION_RULE_MUTATION, UPDATE_AUTOMATION_RULE_MUTATION, DELETE_AUTOMATION_RULE_MUTATION,
  // Schedules CRUD
  GET_SCHEDULES, INSERT_SCHEDULE_MUTATION, UPDATE_SCHEDULE_MUTATION, DELETE_SCHEDULE_MUTATION,
  // Activity Log CRUD
  INSERT_ACTIVITY_LOG_MUTATION, GET_ACTIVITY_LOG,
  // SCADA Diagram CRUD (Single Diagram Focus)
  SINGLE_SCADA_DIAGRAM_NAME,
  GET_SINGLE_SCADA_DIAGRAM_MODEL,
  INSERT_SINGLE_SCADA_DIAGRAM,
  UPDATE_SINGLE_SCADA_DIAGRAM,
  DELETE_SINGLE_SCADA_DIAGRAM,
  DELETE_SCADA_DIAGRAM_BY_ID,
  DELETE_ALL_DEVICES_MUTATION,
  // KPI CRUD
  INSERT_KPI,
  GET_KPI_DATA,
  DELETE_KPI,
  DELETE_KPI_BY_UID,
  GET_GATEWAYS,
  UPDATE_GATEWAY
}