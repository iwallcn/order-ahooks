export default {
  "data":{
    "isArrangement":"N", // Y排仓
    "isQueue":"Y", // 是否排队
    "appointmentPanelUnitList":[ // 预约列表
      {
        "appointmentTime": '2020-12-20', // 周日
        "isAppointment": 'Y', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"S", // 收货
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"S"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-19',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"S" // 收货
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"S"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-18',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"V"
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"E"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-17',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"V"
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"S"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-16',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"V", // 收货
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"E"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-15',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"S"
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"E"
          }
        ]
      },
      {
        "appointmentTime": '2020-12-14',
        "isAppointment": 'N', // 不可预约
        "unitTypeList":[
          {
            "beginTime": '06:00',
            "endTime": '09:00',
            "appointmentType":"V"
          },
          {
            "beginTime": '09:00',
            "endTime": '11:00',
            "appointmentType":"S"
          }
        ]
      }
    ]
  },
  "type": {
    "A": "收货预约",
    "B": "增值预约",
    "C": "排仓预约",
    "D": "排队预约"
  },
  "list": {
    '2020-12-01':[
      {
        time: '15:00',
        type: 'C',
        unit: 2,
        list: ['TGBU8566995', 'TGBU8566996']
      },
      {
        time: '19:00',
        type: 'D',
        unit: 2,
        list: ['TGBU8566995', 'TGBU8566996']
      }
    ],
    '2020-12-04':[
      {
        time: '07:00',
        type: 'A',
        unit: 2,
        unit: 2,
        list: ['TGBU8566995', 'TGBU8566996']
      },
      {
        time: '09:00',
        type: 'B',
        unit: 2,
        list: ['TGBU8566990', 'TGBU8566993']
      }
    ],
    '2020-12-12': [
      {
        time: '07:00',
        type: 'A',
        unit: 2,
        list: ['TGBU8566990', 'TGBU8566993']
      },
      {
        time: '09:00',
        type: 'B',
        unit: 2,
        list: ['TGBU8566990', 'TGBU8566993']
      },
      {
        time: '11:00',
        type: 'C',
        unit: 5
      },
      {
        time: '13:00',
        type: 'D',
        unit: 6
      },
    ],
  }
}
