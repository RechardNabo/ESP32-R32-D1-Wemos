/**
 * @file extended_can_ids.h
 * @brief Extended CAN ID definitions for distributed monitoring and control system
 * @author Generated for 50-node daisy-chained microcontroller system
 * @version 1.0
 * @date 2025
 * 
 * Extended CAN ID Structure (29-bit):
 * Bits 28-24: Priority (5 bits) - 0=Critical, 31=Lowest priority
 * Bits 23-16: Source Node ID (8 bits) - supports 256 nodes (0-255)
 * Bits 15-8:  Destination Node ID (8 bits) - 0xFF for broadcast, 0xFE for group
 * Bits 7-0:   Message Type (8 bits) - 256 different message categories
 */

#ifndef EXTENDED_CAN_IDS_H
#define EXTENDED_CAN_IDS_H

#include <stdint.h>

/* ========================================================================== */
/*                           CAN ID CONSTRUCTION MACROS                      */
/* ========================================================================== */

// Extended CAN ID construction (29-bit)
#define MAKE_EXTENDED_CAN_ID(priority, src, dest, msg_type) \
    (0x80000000UL | \
     ((uint32_t)(priority & 0x1F) << 24) | \
     ((uint32_t)(src & 0xFF) << 16) | \
     ((uint32_t)(dest & 0xFF) << 8) | \
     ((uint32_t)(msg_type & 0xFF)))

// Extract fields from Extended CAN ID
#define GET_EXT_PRIORITY(id)    ((id >> 24) & 0x1F)
#define GET_EXT_SOURCE(id)      ((id >> 16) & 0xFF)
#define GET_EXT_DEST(id)        ((id >> 8) & 0xFF)
#define GET_EXT_MSG_TYPE(id)    (id & 0xFF)

// Check if Extended ID
#define IS_EXTENDED_ID(id)      ((id & 0x80000000UL) != 0)

/* ========================================================================== */
/*                              PRIORITY LEVELS                              */
/* ========================================================================== */

// Emergency/Critical Priority (0-3)
#define PRIORITY_EMERGENCY      0
#define PRIORITY_CRITICAL       1
#define PRIORITY_SAFETY         2
#define PRIORITY_ALARM          3

// High Priority (4-7)
#define PRIORITY_CONTROL        4
#define PRIORITY_COMMAND        5
#define PRIORITY_ERROR          6
#define PRIORITY_WARNING        7

// Normal Priority (8-15)
#define PRIORITY_SENSOR_DATA    8
#define PRIORITY_STATUS         9
#define PRIORITY_RESPONSE       10
#define PRIORITY_ACK            11
#define PRIORITY_HEARTBEAT      12
#define PRIORITY_NORMAL_13      13
#define PRIORITY_NORMAL_14      14
#define PRIORITY_NORMAL_15      15

// Low Priority (16-23)
#define PRIORITY_CONFIG         16
#define PRIORITY_DIAGNOSTIC     17
#define PRIORITY_STATISTICS     18
#define PRIORITY_LOGGING        19
#define PRIORITY_LOW_20         20
#define PRIORITY_LOW_21         21
#define PRIORITY_LOW_22         22
#define PRIORITY_LOW_23         23

// Background Priority (24-31)
#define PRIORITY_FIRMWARE       24
#define PRIORITY_MAINTENANCE    25
#define PRIORITY_HISTORICAL     26
#define PRIORITY_BACKGROUND_27  27
#define PRIORITY_BACKGROUND_28  28
#define PRIORITY_BACKGROUND_29  29
#define PRIORITY_BACKGROUND_30  30
#define PRIORITY_LOWEST         31

/* ========================================================================== */
/*                            SPECIAL ADDRESSES                              */
/* ========================================================================== */

#define EXT_DEST_BROADCAST      0xFF    // Broadcast to all nodes
#define EXT_DEST_GROUP          0xFE    // Group broadcast
#define EXT_DEST_CONTROLLER     0x00    // Main controller
#define EXT_DEST_GATEWAY        0x01    // Gateway node
#define EXT_DEST_LOGGER         0x02    // Data logger node
#define EXT_DEST_HMI            0x03    // Human Machine Interface

/* ========================================================================== */
/*                        SYSTEM ARCHITECTURE & DISCOVERY                    */
/*                               (0x00-0x0F)                                 */
/* ========================================================================== */

#define MSG_NODE_DISCOVERY              0x00    // Node discovery/enumeration
#define MSG_ARCHITECTURE_ID             0x01    // Architecture identification (ARM, AVR, PIC, etc.)
#define MSG_CAPABILITY_ANNOUNCE         0x02    // Capability announcement (sensors, actuators available)
#define MSG_NETWORK_TOPOLOGY            0x03    // Network topology mapping
#define MSG_FIRMWARE_VERSION            0x04    // Firmware version info
#define MSG_HARDWARE_REVISION           0x05    // Hardware revision info
#define MSG_SERIAL_NUMBER               0x06    // Serial number broadcast
#define MSG_MANUFACTURING_INFO          0x07    // Manufacturing date/info
#define MSG_NODE_NAME                   0x08    // Node name/description
#define MSG_PHYSICAL_LOCATION           0x09    // Physical location info
#define MSG_POWER_SUPPLY_SPECS          0x0A    // Power supply specifications
#define MSG_MEMORY_CAPACITY             0x0B    // Memory capacity info
#define MSG_PROCESSING_CAPABILITIES     0x0C    // Processing speed/capabilities
#define MSG_IO_PORT_CONFIG              0x0D    // I/O port configuration
#define MSG_COMM_INTERFACE_INFO         0x0E    // Communication interface info
#define MSG_NODE_ROLE_FUNCTION          0x0F    // Node role/function definition

/* ========================================================================== */
/*                           SYSTEM CONTROL COMMANDS                         */
/*                               (0x10-0x1F)                                 */
/* ========================================================================== */

#define MSG_START_STOP_COMMANDS         0x10    // Start/stop commands
#define MSG_CONFIGURATION_UPDATES       0x11    // Configuration updates
#define MSG_CALIBRATION_COMMANDS        0x12    // Calibration commands
#define MSG_RESET_COMMANDS              0x13    // Reset commands (soft/hard)
#define MSG_MODE_SWITCHING              0x14    // Mode switching (auto/manual/test)
#define MSG_FIRMWARE_UPDATE_INIT        0x15    // Firmware update initiation
#define MSG_FACTORY_RESET               0x16    // Factory reset
#define MSG_SLEEP_WAKE_COMMANDS         0x17    // Sleep/wake commands
#define MSG_EMERGENCY_STOP              0x18    // Emergency stop
#define MSG_SYSTEM_SYNCHRONIZATION      0x19    // System synchronization
#define MSG_TIME_SYNCHRONIZATION        0x1A    // Time synchronization
#define MSG_PARAMETER_DOWNLOAD          0x1B    // Parameter download
#define MSG_PARAMETER_UPLOAD            0x1C    // Parameter upload
#define MSG_BOOTLOADER_ACTIVATION       0x1D    // Bootloader activation
#define MSG_SECURITY_AUTHENTICATION     0x1E    // Security/authentication
#define MSG_LICENSE_ACTIVATION          0x1F    // License/activation codes

/* ========================================================================== */
/*                            TEMPERATURE SENSORS                            */
/*                               (0x20-0x2F)                                 */
/* ========================================================================== */

#define MSG_TEMP_AMBIENT                0x20    // Ambient temperature sensors
#define MSG_TEMP_INTERNAL_MCU           0x21    // Internal MCU temperature
#define MSG_TEMP_EXTERNAL_PROBE         0x22    // External probe temperature
#define MSG_TEMP_SURFACE_CONTACT        0x23    // Surface temperature (contact)
#define MSG_TEMP_INFRARED_NONCONTACT    0x24    // Infrared temperature (non-contact)
#define MSG_TEMP_THERMOCOUPLE           0x25    // Thermocouple readings
#define MSG_TEMP_RTD                    0x26    // RTD (Resistance Temperature Detector) readings
#define MSG_TEMP_THERMISTOR             0x27    // Thermistor readings
#define MSG_TEMP_IC_SENSOR              0x28    // Integrated circuit temperature sensors
#define MSG_TEMP_BIMETALLIC             0x29    // Bimetallic temperature sensors
#define MSG_TEMP_LIQUID                 0x2A    // Liquid temperature sensors
#define MSG_TEMP_GAS                    0x2B    // Gas temperature sensors
#define MSG_TEMP_DIFFERENTIAL           0x2C    // Differential temperature measurements
#define MSG_TEMP_ALARM_CONDITIONS       0x2D    // Temperature alarm conditions
#define MSG_TEMP_TREND_ANALYSIS         0x2E    // Temperature trend analysis
#define MSG_TEMP_CALIBRATION_DATA       0x2F    // Temperature calibration data

/* ========================================================================== */
/*                             PRESSURE SENSORS                              */
/*                               (0x30-0x3F)                                 */
/* ========================================================================== */

#define MSG_PRESSURE_ATMOSPHERIC        0x30    // Atmospheric pressure
#define MSG_PRESSURE_GAUGE              0x31    // Gauge pressure
#define MSG_PRESSURE_ABSOLUTE           0x32    // Absolute pressure
#define MSG_PRESSURE_DIFFERENTIAL       0x33    // Differential pressure
#define MSG_PRESSURE_VACUUM             0x34    // Vacuum pressure
#define MSG_PRESSURE_HYDRAULIC          0x35    // Hydraulic pressure
#define MSG_PRESSURE_PNEUMATIC          0x36    // Pneumatic pressure
#define MSG_PRESSURE_BLOOD              0x37    // Blood pressure (medical applications)
#define MSG_PRESSURE_TIRE               0x38    // Tire pressure
#define MSG_PRESSURE_BAROMETRIC         0x39    // Barometric pressure
#define MSG_PRESSURE_COMPRESSOR         0x3A    // Compressor pressure
#define MSG_PRESSURE_PIPELINE           0x3B    // Pipeline pressure
#define MSG_PRESSURE_TANK               0x3C    // Tank pressure
#define MSG_PRESSURE_SWITCH_STATES      0x3D    // Pressure switch states
#define MSG_PRESSURE_ALARM_CONDITIONS   0x3E    // Pressure alarm conditions
#define MSG_PRESSURE_CALIBRATION_DATA   0x3F    // Pressure calibration data

/* ========================================================================== */
/*                           FLOW & LEVEL SENSORS                            */
/*                               (0x40-0x4F)                                 */
/* ========================================================================== */

#define MSG_FLOW_LIQUID_RATE            0x40    // Liquid flow rate
#define MSG_FLOW_GAS_RATE               0x41    // Gas flow rate
#define MSG_FLOW_MASS_RATE              0x42    // Mass flow rate
#define MSG_FLOW_VOLUMETRIC_RATE        0x43    // Volumetric flow rate
#define MSG_FLOW_DIRECTION              0x44    // Flow direction
#define MSG_FLOW_TURBINE_METERS         0x45    // Turbine flow meters
#define MSG_FLOW_ULTRASONIC_METERS      0x46    // Ultrasonic flow meters
#define MSG_FLOW_ELECTROMAGNETIC_METERS 0x47    // Electromagnetic flow meters
#define MSG_LEVEL_LIQUID_SENSORS        0x48    // Liquid level sensors
#define MSG_LEVEL_TANK_INDICATORS       0x49    // Tank level indicators
#define MSG_LEVEL_FLOAT_SWITCHES        0x4A    // Float level switches
#define MSG_LEVEL_CAPACITIVE_SENSORS    0x4B    // Capacitive level sensors
#define MSG_LEVEL_ULTRASONIC_SENSORS    0x4C    // Ultrasonic level sensors
#define MSG_LEVEL_RADAR_SENSORS         0x4D    // Radar level sensors
#define MSG_FLOW_TOTALIZERS             0x4E    // Flow totalizers
#define MSG_LEVEL_ALARM_CONDITIONS      0x4F    // Level alarm conditions

/* ========================================================================== */
/*                          ENVIRONMENTAL SENSORS                            */
/*                               (0x50-0x5F)                                 */
/* ========================================================================== */

#define MSG_ENV_HUMIDITY                0x50    // Humidity sensors (relative/absolute)
#define MSG_ENV_AIR_QUALITY             0x51    // Air quality sensors (CO2, CO, NOx)
#define MSG_ENV_PARTICULATE_MATTER      0x52    // Particulate matter sensors (PM2.5, PM10)
#define MSG_ENV_VOC                     0x53    // VOC (Volatile Organic Compound) sensors
#define MSG_ENV_OXYGEN_CONCENTRATION    0x54    // Oxygen concentration sensors
#define MSG_ENV_LIGHT_SENSORS           0x55    // Light sensors (visible, UV, IR)
#define MSG_ENV_SOUND_NOISE_LEVEL       0x56    // Sound/noise level sensors
#define MSG_ENV_WIND_SPEED              0x57    // Wind speed sensors
#define MSG_ENV_WIND_DIRECTION          0x58    // Wind direction sensors
#define MSG_ENV_RAIN_PRECIPITATION      0x59    // Rain/precipitation sensors
#define MSG_ENV_SOIL_MOISTURE           0x5A    // Soil moisture sensors
#define MSG_ENV_PH_SENSORS              0x5B    // pH sensors
#define MSG_ENV_CONDUCTIVITY            0x5C    // Conductivity sensors
#define MSG_ENV_TURBIDITY               0x5D    // Turbidity sensors
#define MSG_ENV_RADIATION               0x5E    // Radiation sensors
#define MSG_ENV_WEATHER_STATION         0x5F    // Weather station data

/* ========================================================================== */
/*                         MOTION & POSITION SENSORS                         */
/*                               (0x60-0x6F)                                 */
/* ========================================================================== */

#define MSG_MOTION_ACCELEROMETER_3AXIS  0x60    // 3-axis accelerometer data
#define MSG_MOTION_GYROSCOPE_3AXIS      0x61    // 3-axis gyroscope data
#define MSG_MOTION_MAGNETOMETER_3AXIS   0x62    // 3-axis magnetometer data
#define MSG_POSITION_GPS_COORDINATES    0x63    // GPS coordinates
#define MSG_POSITION_GLONASS_COORDINATES 0x64   // GLONASS coordinates
#define MSG_POSITION_ENCODER_INCREMENTAL 0x65   // Encoder position data (incremental)
#define MSG_POSITION_ENCODER_ABSOLUTE   0x66    // Encoder position data (absolute)
#define MSG_PROXIMITY_SENSORS           0x67    // Proximity sensors (inductive, capacitive)
#define MSG_DISTANCE_SENSORS            0x68    // Distance sensors (ultrasonic, laser)
#define MSG_TILT_INCLINATION            0x69    // Tilt/inclination sensors
#define MSG_POSITION_LINEAR_SENSORS     0x6A    // Linear position sensors (LVDT, potentiometer)
#define MSG_POSITION_ROTARY_SENSORS     0x6B    // Rotary position sensors
#define MSG_MOTION_DETECTION            0x6C    // Motion detection (PIR, microwave)
#define MSG_IMU_DATA                    0x6D    // Inertial measurement unit (IMU) data
#define MSG_VELOCITY_SPEED              0x6E    // Velocity/speed measurements
#define MSG_DISPLACEMENT                0x6F    // Displacement measurements

/* ========================================================================== */
/*                           FORCE & LOAD SENSORS                            */
/*                               (0x70-0x7F)                                 */
/* ========================================================================== */

#define MSG_FORCE_LOAD_CELL             0x70    // Load cell measurements
#define MSG_FORCE_STRAIN_GAUGE          0x71    // Strain gauge readings
#define MSG_FORCE_TORQUE_SENSORS        0x72    // Torque sensors
#define MSG_FORCE_COMPRESSION           0x73    // Force sensors (compression)
#define MSG_FORCE_TENSION               0x74    // Force sensors (tension)
#define MSG_FORCE_SHEAR                 0x75    // Force sensors (shear)
#define MSG_FORCE_WEIGHT_SCALES         0x76    // Weight scales
#define MSG_FORCE_PLATFORM_SCALES       0x77    // Platform scales
#define MSG_FORCE_CRANE_LOAD            0x78    // Crane load monitoring
#define MSG_FORCE_VEHICLE_WEIGHT        0x79    // Vehicle weight sensors
#define MSG_FORCE_IMPACT                0x7A    // Impact force sensors
#define MSG_VIBRATION_SENSORS           0x7B    // Vibration sensors
#define MSG_SHOCK_SENSORS               0x7C    // Shock sensors
#define MSG_SEISMIC_SENSORS             0x7D    // Seismic sensors
#define MSG_FORCE_DYNAMIC               0x7E    // Dynamic force measurements
#define MSG_FORCE_CALIBRATION_DATA      0x7F    // Force calibration data

/* ========================================================================== */
/*                         ELECTRICAL MEASUREMENTS                           */
/*                               (0x80-0x8F)                                 */
/* ========================================================================== */

#define MSG_ELECTRICAL_DC_VOLTAGE       0x80    // DC voltage measurements
#define MSG_ELECTRICAL_AC_VOLTAGE_RMS   0x81    // AC voltage measurements (RMS)
#define MSG_ELECTRICAL_DC_CURRENT       0x82    // DC current measurements
#define MSG_ELECTRICAL_AC_CURRENT_RMS   0x83    // AC current measurements (RMS)
#define MSG_ELECTRICAL_ACTIVE_POWER     0x84    // Active power measurements
#define MSG_ELECTRICAL_REACTIVE_POWER   0x85    // Reactive power measurements
#define MSG_ELECTRICAL_APPARENT_POWER   0x86    // Apparent power measurements
#define MSG_ELECTRICAL_POWER_FACTOR     0x87    // Power factor measurements
#define MSG_ELECTRICAL_FREQUENCY        0x88    // Frequency measurements
#define MSG_ELECTRICAL_ENERGY_KWH       0x89    // Energy consumption (kWh)
#define MSG_ELECTRICAL_RESISTANCE       0x8A    // Resistance measurements
#define MSG_ELECTRICAL_CAPACITANCE      0x8B    // Capacitance measurements
#define MSG_ELECTRICAL_INDUCTANCE       0x8C    // Inductance measurements
#define MSG_ELECTRICAL_IMPEDANCE        0x8D    // Impedance measurements
#define MSG_ELECTRICAL_HARMONIC_ANALYSIS 0x8E   // Harmonic analysis
#define MSG_ELECTRICAL_POWER_QUALITY    0x8F    // Power quality analysis

/* ========================================================================== */
/*                       BATTERY & POWER MANAGEMENT                          */
/*                               (0x90-0x9F)                                 */
/* ========================================================================== */

#define MSG_BATTERY_VOLTAGE             0x90    // Battery voltage
#define MSG_BATTERY_CURRENT             0x91    // Battery current (charge/discharge)
#define MSG_BATTERY_SOC                 0x92    // Battery state of charge (SOC)
#define MSG_BATTERY_SOH                 0x93    // Battery state of health (SOH)
#define MSG_BATTERY_TEMPERATURE         0x94    // Battery temperature
#define MSG_SOLAR_PANEL_VOLTAGE         0x95    // Solar panel voltage
#define MSG_SOLAR_PANEL_CURRENT         0x96    // Solar panel current
#define MSG_SOLAR_PANEL_POWER           0x97    // Solar panel power output
#define MSG_UPS_STATUS                  0x98    // UPS status
#define MSG_GENERATOR_STATUS            0x99    // Generator status
#define MSG_POWER_SUPPLY_EFFICIENCY     0x9A    // Power supply efficiency
#define MSG_BACKUP_POWER_AVAILABILITY   0x9B    // Backup power availability
#define MSG_ENERGY_STORAGE_STATUS       0x9C    // Energy storage status
#define MSG_LOAD_BALANCING_DATA         0x9D    // Load balancing data
#define MSG_POWER_CONSUMPTION_HISTORY   0x9E    // Power consumption history
#define MSG_POWER_MANAGEMENT_ALARMS     0x9F    // Power management alarms

/* ========================================================================== */
/*                            DIGITAL I/O STATES                             */
/*                               (0xA0-0xAF)                                 */
/* ========================================================================== */

#define MSG_DIO_INPUT_STATES_INDIVIDUAL 0xA0    // Digital input states (individual)
#define MSG_DIO_INPUT_STATES_PORT       0xA1    // Digital input states (port-wise)
#define MSG_DIO_OUTPUT_STATES_INDIVIDUAL 0xA2   // Digital output states (individual)
#define MSG_DIO_OUTPUT_STATES_PORT      0xA3    // Digital output states (port-wise)
#define MSG_DIO_SWITCH_POSITIONS        0xA4    // Switch positions
#define MSG_DIO_BUTTON_STATES           0xA5    // Button states
#define MSG_DIO_RELAY_STATES            0xA6    // Relay states
#define MSG_DIO_CONTACTOR_STATES        0xA7    // Contactor states
#define MSG_DIO_LED_INDICATORS          0xA8    // LED indicators
#define MSG_DIO_STATUS_LIGHTS           0xA9    // Status lights
#define MSG_DIO_ALARM_INDICATORS        0xAA    // Alarm indicators
#define MSG_DIO_SAFETY_SWITCHES         0xAB    // Safety switches
#define MSG_DIO_LIMIT_SWITCHES          0xAC    // Limit switches
#define MSG_DIO_EMERGENCY_STOPS         0xAD    // Emergency stops
#define MSG_DIO_INTERLOCKS              0xAE    // Interlocks
#define MSG_DIO_CONFIGURATION           0xAF    // Digital I/O configuration

/* ========================================================================== */
/*                             ANALOG I/O DATA                               */
/*                               (0xB0-0xBF)                                 */
/* ========================================================================== */

#define MSG_AIO_ADC_CHANNEL_0_7         0xB0    // ADC channel 0-7 readings
#define MSG_AIO_ADC_CHANNEL_8_15        0xB1    // ADC channel 8-15 readings
#define MSG_AIO_HIGH_RES_ADC            0xB2    // High-resolution ADC readings
#define MSG_AIO_DIFFERENTIAL_ADC        0xB3    // Differential ADC readings
#define MSG_AIO_DAC_OUTPUT_VALUES       0xB4    // DAC output values
#define MSG_AIO_ANALOG_SETPOINTS        0xB5    // Analog setpoint values
#define MSG_AIO_4_20MA_LOOP             0xB6    // 4-20mA loop readings
#define MSG_AIO_0_10V_SIGNALS           0xB7    // 0-10V analog signals
#define MSG_AIO_THERMOCOUPLE_AMP        0xB8    // Thermocouple amplifier outputs
#define MSG_AIO_INSTRUMENTATION_AMP     0xB9    // Instrumentation amplifier outputs
#define MSG_AIO_SIGNAL_CONDITIONING     0xBA    // Signal conditioning outputs
#define MSG_AIO_ANALOG_MULTIPLEXER      0xBB    // Analog multiplexer data
#define MSG_AIO_SAMPLE_HOLD             0xBC    // Sample and hold values
#define MSG_AIO_PEAK_VALLEY_DETECTION   0xBD    // Peak/valley detection
#define MSG_AIO_ANALOG_TRENDING         0xBE    // Analog trending data
#define MSG_AIO_ANALOG_CALIBRATION      0xBF    // Analog calibration values

/* ========================================================================== */
/*                           PWM & TIMING CONTROL                            */
/*                               (0xC0-0xCF)                                 */
/* ========================================================================== */

#define MSG_PWM_DUTY_CYCLE              0xC0    // PWM duty cycle values
#define MSG_PWM_FREQUENCY_SETTINGS      0xC1    // PWM frequency settings
#define MSG_SERVO_MOTOR_POSITIONS       0xC2    // Servo motor positions
#define MSG_STEPPER_MOTOR_POSITIONS     0xC3    // Stepper motor positions
#define MSG_MOTOR_SPEED_CONTROL         0xC4    // Motor speed control
#define MSG_FAN_SPEED_CONTROL           0xC5    // Fan speed control
#define MSG_HEATER_CONTROL_OUTPUTS      0xC6    // Heater control outputs
#define MSG_VALVE_POSITION_CONTROL      0xC7    // Valve position control
#define MSG_PUMP_SPEED_CONTROL          0xC8    // Pump speed control
#define MSG_TIMER_VALUES                0xC9    // Timer values
#define MSG_COUNTER_VALUES              0xCA    // Counter values
#define MSG_FREQUENCY_GENERATION        0xCB    // Frequency generation
#define MSG_PULSE_WIDTH_MEASUREMENTS    0xCC    // Pulse width measurements
#define MSG_DUTY_CYCLE_MEASUREMENTS     0xCD    // Duty cycle measurements
#define MSG_PHASE_CONTROL               0xCE    // Phase control
#define MSG_TIMING_SYNCHRONIZATION      0xCF    // Timing synchronization

/* ========================================================================== */
/*                             PROCESS CONTROL                               */
/*                               (0xD0-0xDF)                                 */
/* ========================================================================== */

#define MSG_PID_CONTROLLER_SETPOINTS    0xD0    // PID controller setpoints
#define MSG_PID_PROCESS_VARIABLES       0xD1    // PID controller process variables
#define MSG_PID_CONTROLLER_OUTPUTS      0xD2    // PID controller outputs
#define MSG_PID_TUNING_PARAMETERS       0xD3    // PID tuning parameters
#define MSG_CONTROL_LOOP_STATUS         0xD4    // Control loop status
#define MSG_PROCESS_ALARMS              0xD5    // Process alarms
#define MSG_SAFETY_INTERLOCKS           0xD6    // Safety interlocks
#define MSG_RECIPE_PARAMETERS           0xD7    // Recipe parameters
#define MSG_BATCH_CONTROL_DATA          0xD8    // Batch control data
#define MSG_SEQUENTIAL_CONTROL_STATES   0xD9    // Sequential control states
#define MSG_QUALITY_CONTROL_MEASUREMENTS 0xDA   // Quality control measurements
#define MSG_PRODUCTION_COUNTERS         0xDB    // Production counters
#define MSG_EFFICIENCY_METRICS          0xDC    // Efficiency metrics
#define MSG_PERFORMANCE_INDICATORS      0xDD    // Performance indicators
#define MSG_STATISTICAL_PROCESS_CONTROL 0xDE    // Statistical process control
#define MSG_PROCESS_OPTIMIZATION        0xDF    // Process optimization data

/* ========================================================================== */
/*                        COMMUNICATION & NETWORK                            */
/*                               (0xE0-0xEF)                                 */
/* ========================================================================== */

#define MSG_COMM_HEARTBEAT_KEEPALIVE    0xE0    // Heartbeat/keepalive messages
#define MSG_COMM_NETWORK_STATUS         0xE1    // Network status reports
#define MSG_COMM_BANDWIDTH_UTILIZATION  0xE2    // Bandwidth utilization
#define MSG_COMM_MESSAGE_STATISTICS     0xE3    // Message statistics
#define MSG_COMM_ERROR_COUNTERS         0xE4    // Error counters
#define MSG_COMM_RETRANSMISSION_REQUESTS 0xE5   // Retransmission requests
#define MSG_COMM_ACKNOWLEDGMENTS        0xE6    // Acknowledgment messages
#define MSG_COMM_ROUTING_TABLE_UPDATES  0xE7    // Routing table updates
#define MSG_COMM_NETWORK_DISCOVERY      0xE8    // Network discovery responses
#define MSG_COMM_TIME_SYNCHRONIZATION   0xE9    // Time synchronization data
#define MSG_COMM_DATA_LOGGING_STATUS    0xEA    // Data logging status
#define MSG_COMM_BUFFER_STATUS          0xEB    // Buffer status reports
#define MSG_COMM_QUEUE_LENGTH_MONITORING 0xEC   // Queue length monitoring
#define MSG_COMM_COMMUNICATION_ERRORS   0xED    // Communication errors
#define MSG_COMM_PROTOCOL_VERSION       0xEE    // Protocol version info
#define MSG_COMM_NETWORK_CONFIGURATION  0xEF    // Network configuration

/* ========================================================================== */
/*                          DIAGNOSTICS & HEALTH                             */
/*                               (0xF0-0xFF)                                 */
/* ========================================================================== */

#define MSG_DIAG_SYSTEM_HEALTH_STATUS   0xF0    // System health status
#define MSG_DIAG_ERROR_REPORTING        0xF1    // Error reporting
#define MSG_DIAG_WARNING_NOTIFICATIONS  0xF2    // Warning notifications
#define MSG_DIAG_CRITICAL_ALARMS        0xF3    // Critical alarms
#define MSG_DIAG_PERFORMANCE_METRICS    0xF4    // Performance metrics
#define MSG_DIAG_CPU_UTILIZATION        0xF5    // CPU utilization
#define MSG_DIAG_MEMORY_UTILIZATION     0xF6    // Memory utilization
#define MSG_DIAG_INTERNAL_TEMPERATURE   0xF7    // Internal temperature monitoring
#define MSG_DIAG_INTERNAL_VOLTAGE       0xF8    // Internal voltage monitoring
#define MSG_DIAG_WATCHDOG_STATUS        0xF9    // Watchdog status
#define MSG_DIAG_SELF_TEST_RESULTS      0xFA    // Self-test results
#define MSG_DIAG_CALIBRATION_STATUS     0xFB    // Calibration status
#define MSG_DIAG_MAINTENANCE_SCHEDULES  0xFC    // Maintenance schedules
#define MSG_DIAG_FAILURE_PREDICTIONS    0xFD    // Failure predictions
#define MSG_DIAG_DATA_DUMPS             0xFE    // Diagnostic data dumps
#define MSG_DIAG_SYSTEM_INFO_SUMMARY    0xFF    // System information summary

/* ========================================================================== */
/*                              UTILITY MACROS                               */
/* ========================================================================== */

// Commonly used message combinations
#define EMERGENCY_STOP_BROADCAST(src) \
    MAKE_EXTENDED_CAN_ID(PRIORITY_EMERGENCY, src, EXT_DEST_BROADCAST, MSG_EMERGENCY_STOP)

#define HEARTBEAT_BROADCAST(src) \
    MAKE_EXTENDED_CAN_ID(PRIORITY_HEARTBEAT, src, EXT_DEST_BROADCAST, MSG_COMM_HEARTBEAT_KEEPALIVE)

#define TEMP_SENSOR_DATA(src, dest) \
    MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, src, dest, MSG_TEMP_AMBIENT)

#define PID_SETPOINT_COMMAND(src, dest) \
    MAKE_EXTENDED_CAN_ID(PRIORITY_CONTROL, src, dest, MSG_PID_CONTROLLER_SETPOINTS)

#define SYSTEM_ERROR_REPORT(src) \
    MAKE_EXTENDED_CAN_ID(PRIORITY_ERROR, src, EXT_DEST_CONTROLLER, MSG_DIAG_ERROR_REPORTING)

// Message validation macros
#define IS_VALID_PRIORITY(p)        ((p) <= 31)
#define IS_VALID_NODE_ID(n)         ((n) <= 255)
#define IS_VALID_MSG_TYPE(m)        ((m) <= 255)
#define IS_BROADCAST_MSG(id)        (GET_EXT_DEST(id) == EXT_DEST_BROADCAST)
#define IS_GROUP_MSG(id)            (GET_EXT_DEST(id) == EXT_DEST_GROUP)

// Message type category checking macros
#define IS_SYSTEM_ARCH_MSG(m)       ((m) >= 0x00 && (m) <= 0x0F)
#define IS_CONTROL_CMD_MSG(m)       ((m) >= 0x10 && (m) <= 0x1F)
#define IS_TEMP_SENSOR_MSG(m)       ((m) >= 0x20 && (m) <= 0x2F)
#define IS_PRESSURE_SENSOR_MSG(m)   ((m) >= 0x30 && (m) <= 0x3F)
#define IS_FLOW_LEVEL_MSG(m)        ((m) >= 0x40 && (m) <= 0x4F)
#define IS_ENV_SENSOR_MSG(m)        ((m) >= 0x50 && (m) <= 0x5F)
#define IS_MOTION_POS_MSG(m)        ((m) >= 0x60 && (m) <= 0x6F)
#define IS_FORCE_LOAD_MSG(m)        ((m) >= 0x70 && (m) <= 0x7F)
#define IS_ELECTRICAL_MSG(m)        ((m) >= 0x80 && (m) <= 0x8F)
#define IS_BATTERY_POWER_MSG(m)     ((m) >= 0x90 && (m) <= 0x9F)
#define IS_DIGITAL_IO_MSG(m)        ((m) >= 0xA0 && (m) <= 0xAF)
#define IS_ANALOG_IO_MSG(m)         ((m) >= 0xB0 && (m) <= 0xBF)
#define IS_PWM_TIMING_MSG(m)        ((m) >= 0xC0 && (m) <= 0xCF)
#define IS_PROCESS_CONTROL_MSG(m)   ((m) >= 0xD0 && (m) <= 0xDF)
#define IS_COMM_NETWORK_MSG(m)      ((m) >= 0xE0 && (m) <= 0xEF)
#define IS_DIAGNOSTIC_MSG(m)        ((m) >= 0xF0 && (m) <= 0xFF)

// Priority category checking macros
#define IS_EMERGENCY_PRIORITY(p)    ((p) >= 0 && (p) <= 3)
#define IS_HIGH_PRIORITY(p)         ((p) >= 4 && (p) <= 7)
#define IS_NORMAL_PRIORITY(p)       ((p) >= 8 && (p) <= 15)
#define IS_LOW_PRIORITY(p)          ((p) >= 16 && (p) <= 23)
#define IS_BACKGROUND_PRIORITY(p)   ((p) >= 24 && (p) <= 31)
/* ========================================================================== */
/*                           DATA STRUCTURE HELPERS                          */
/* ========================================================================== */

// Common data payload structures for different message types
typedef struct {
    uint32_t CAN_ID;
    uint8_t DLC;        // Data Length Code (0-8 for CAN)
    uint8_t DATA[8];    // CAN data payload
} CAN_MESSAGE_T;

// Temperature data payload structure
typedef struct {
    int16_t TEMPERATURE;    // Temperature in 0.1°C increments
    uint8_t SENSOR_ID;      // Sensor identifier
    uint8_t STATUS;         // Sensor status flags
    uint32_t TIMESTAMP;     // Optional timestamp
} TEMP_DATA_PAYLOAD_T;

// Pressure data payload structure
typedef struct {
    uint32_t PRESSURE;      // Pressure in Pa or specified units
    uint8_t SENSOR_ID;      // Sensor identifier
    uint8_t STATUS;         // Sensor status flags
    uint8_t UNITS;          // Units identifier
} PRESSURE_DATA_PAYLOAD_T;

// Digital I/O data payload structure
typedef struct {
    uint32_t INPUT_STATES;  // 32-bit input state mask
    uint32_t OUTPUT_STATES; // 32-bit output state mask
} DIGITAL_IO_PAYLOAD_T;

// System health payload structure
typedef struct {
    uint8_t HEALTH_STATUS;  // Overall health percentage (0-100)
    uint8_t CPU_USAGE;      // CPU usage percentage (0-100)
    uint8_t MEMORY_USAGE;   // Memory usage percentage (0-100)
    uint8_t TEMPERATURE;    // Internal temperature
    uint16_t VOLTAGE_MV;    // Supply voltage in millivolts
    uint16_t ERROR_COUNT;   // Number of errors since last reset
} SYSTEM_HEALTH_PAYLOAD_T;

// Node discovery response payload structure
typedef struct {
    uint8_t NODE_ID;        // Node identifier
    uint8_t NODE_TYPE;      // Node type/architecture
    uint16_t CAPABILITIES;  // Capability flags
    uint16_t FIRMWARE_VER;  // Firmware version
    uint16_t HARDWARE_VER;  // Hardware version
} NODE_DISCOVERY_PAYLOAD_T;

/* ========================================================================== */
/*                            ERROR CODES                                    */
/* ========================================================================== */

// System error codes for error reporting messages
#define ERROR_CODE_NO_ERROR             0x00
#define ERROR_CODE_GENERAL_FAULT        0x01
#define ERROR_CODE_COMMUNICATION_FAULT  0x02
#define ERROR_CODE_SENSOR_FAULT         0x03
#define ERROR_CODE_ACTUATOR_FAULT       0x04
#define ERROR_CODE_POWER_FAULT          0x05
#define ERROR_CODE_TEMPERATURE_FAULT    0x06
#define ERROR_CODE_PRESSURE_FAULT       0x07
#define ERROR_CODE_FLOW_FAULT           0x08
#define ERROR_CODE_POSITION_FAULT       0x09
#define ERROR_CODE_CALIBRATION_FAULT    0x0A
#define ERROR_CODE_CONFIGURATION_FAULT  0x0B
#define ERROR_CODE_FIRMWARE_FAULT       0x0C
#define ERROR_CODE_HARDWARE_FAULT       0x0D
#define ERROR_CODE_SECURITY_FAULT       0x0E
#define ERROR_CODE_TIMEOUT_FAULT        0x0F
#define ERROR_CODE_OVERLOAD_FAULT       0x10
#define ERROR_CODE_UNDERLOAD_FAULT      0x11
#define ERROR_CODE_OVERHEAT_FAULT       0x12
#define ERROR_CODE_OVERCURRENT_FAULT    0x13
#define ERROR_CODE_OVERVOLTAGE_FAULT    0x14
#define ERROR_CODE_UNDERVOLTAGE_FAULT   0x15
#define ERROR_CODE_MEMORY_FAULT         0x16
#define ERROR_CODE_CHECKSUM_FAULT       0x17
#define ERROR_CODE_PROTOCOL_FAULT       0x18
#define ERROR_CODE_NETWORK_FAULT        0x19

/* ========================================================================== */
/*                           STATUS FLAGS                                    */
/* ========================================================================== */

// General status flags (used in various status fields)
#define STATUS_FLAG_OK              0x00
#define STATUS_FLAG_WARNING         0x01
#define STATUS_FLAG_ERROR           0x02
#define STATUS_FLAG_CRITICAL        0x04
#define STATUS_FLAG_OFFLINE         0x08
#define STATUS_FLAG_MAINTENANCE     0x10
#define STATUS_FLAG_CALIBRATION     0x20
#define STATUS_FLAG_TEST_MODE       0x40
#define STATUS_FLAG_RESERVED        0x80

// Sensor-specific status flags
#define SENSOR_STATUS_ACTIVE        0x01
#define SENSOR_STATUS_OUT_OF_RANGE  0x02
#define SENSOR_STATUS_NEEDS_CAL     0x04
#define SENSOR_STATUS_FAULT         0x08
#define SENSOR_STATUS_DISCONNECTED  0x10

// Actuator-specific status flags
#define ACTUATOR_STATUS_ACTIVE      0x01
#define ACTUATOR_STATUS_MOVING      0x02
#define ACTUATOR_STATUS_AT_LIMIT    0x04
#define ACTUATOR_STATUS_FAULT       0x08
#define ACTUATOR_STATUS_MANUAL      0x10

/* ========================================================================== */
/*                           NODE TYPES                                      */
/* ========================================================================== */

// Node type identifiers for architecture identification
#define NODE_TYPE_CONTROLLER        0x01
#define NODE_TYPE_SENSOR_NODE       0x02
#define NODE_TYPE_ACTUATOR_NODE     0x03
#define NODE_TYPE_IO_NODE           0x04
#define NODE_TYPE_GATEWAY           0x05
#define NODE_TYPE_HMI               0x06
#define NODE_TYPE_DATA_LOGGER       0x07
#define NODE_TYPE_POWER_MONITOR     0x08
#define NODE_TYPE_SAFETY_NODE       0x09
#define NODE_TYPE_DIAGNOSTIC_NODE   0x0A
#define NODE_TYPE_BRIDGE            0x0B
#define NODE_TYPE_REPEATER          0x0C
#define NODE_TYPE_TERMINATOR        0x0D
#define NODE_TYPE_CUSTOM            0xFE
#define NODE_TYPE_UNKNOWN           0xFF

/* ========================================================================== */
/*                         CAPABILITY FLAGS                                  */
/* ========================================================================== */

// Node capability flags (16-bit field)
#define CAPABILITY_TEMPERATURE      0x0001
#define CAPABILITY_PRESSURE         0x0002
#define CAPABILITY_FLOW             0x0004
#define CAPABILITY_LEVEL            0x0008
#define CAPABILITY_POSITION         0x0010
#define CAPABILITY_MOTION           0x0020
#define CAPABILITY_FORCE            0x0040
#define CAPABILITY_ELECTRICAL       0x0080
#define CAPABILITY_ENVIRONMENTAL    0x0100
#define CAPABILITY_DIGITAL_IO       0x0200
#define CAPABILITY_ANALOG_IO        0x0400
#define CAPABILITY_PWM              0x0800
#define CAPABILITY_COMMUNICATION    0x1000
#define CAPABILITY_POWER_MGMT       0x2000
#define CAPABILITY_DIAGNOSTICS      0x4000
#define CAPABILITY_CONTROL          0x8000

/* ========================================================================== */
/*                           TIMING CONSTANTS                                */
/* ========================================================================== */

// Timing constants for various operations (in milliseconds)
#define HEARTBEAT_INTERVAL_MS       1000    // Standard heartbeat interval
#define FAST_HEARTBEAT_INTERVAL_MS  100     // Fast heartbeat for critical nodes
#define DISCOVERY_INTERVAL_MS       5000    // Node discovery broadcast interval
#define TIMEOUT_RESPONSE_MS         500     // Response timeout
#define TIMEOUT_HEARTBEAT_MS        3000    // Heartbeat timeout (3x interval)
#define RETRY_INTERVAL_MS           100     // Retry interval for failed messages
#define MAX_RETRY_COUNT             3       // Maximum retry attempts

/* ========================================================================== */
/*                           UTILITY FUNCTIONS                               */
/* ========================================================================== */

// Function prototypes for CAN message handling (implementation needed)
#ifdef __cplusplus
extern "C" {
#endif

// CAN message construction functions
uint32_t create_heartbeat_message(uint8_t node_id);
uint32_t create_discovery_message(uint8_t node_id);
uint32_t create_error_message(uint8_t node_id, uint8_t error_code);
uint32_t create_temp_message(uint8_t node_id, uint8_t dest_id);
uint32_t create_emergency_stop_message(uint8_t node_id);

// CAN message parsing functions
uint8_t parse_message_priority(uint32_t can_id);
uint8_t parse_source_node(uint32_t can_id);
uint8_t parse_dest_node(uint32_t can_id);
uint8_t parse_message_type(uint32_t can_id);

// Message validation functions
int is_valid_can_message(uint32_t can_id);
int is_message_for_node(uint32_t can_id, uint8_t node_id);
int should_process_message(uint32_t can_id, uint8_t node_id);

#ifdef __cplusplus
}
#endif

/* ========================================================================== */
/*                              EXAMPLES                                     */
/* ========================================================================== */

/*
Example Usage:

// Create a temperature sensor message from node 5 to controller
uint32_t temp_msg = MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, 5, EXT_DEST_CONTROLLER, MSG_TEMP_AMBIENT);

// Create an emergency stop broadcast from node 10
uint32_t emergency_msg = EMERGENCY_STOP_BROADCAST(10);

// Create a heartbeat from node 25
uint32_t heartbeat_msg = HEARTBEAT_BROADCAST(25);

// Parse a received message
uint8_t priority = GET_EXT_PRIORITY(received_id);
uint8_t source = GET_EXT_SOURCE(received_id);
uint8_t dest = GET_EXT_DEST(received_id);
uint8_t msg_type = GET_EXT_MSG_TYPE(received_id);

// Check message type categories
if (IS_TEMP_SENSOR_MSG(msg_type)) {
    // Handle temperature sensor data
}
else if (IS_EMERGENCY_PRIORITY(priority)) {
    // Handle emergency message immediately
}

// Validate message
if (is_message_for_node(received_id, my_node_id) || IS_BROADCAST_MSG(received_id)) {
    // Process the message
}
*/

#endif /* EXTENDED_CAN_IDS_H */