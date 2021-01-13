export default {
  "data":{
    "isArrangement":"N", // Y排仓
    "isQueue":"N", // 是否排队
    "appointmentPanelUnitList":[ // 预约列表
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
        type: 'S',
        unit: 2,
        list: ['TGBU8566995', 'TGBU8566996']
      },
      {
        time: '19:00',
        type: 'V',
        unit: 2,
        list: ['TGBU8566995', 'TGBU8566996']
      }
    ]
  },
  "list2": [
		{
			"appointmentTime":"2020-12-01", // 第一步：按照天
			"reservationTimeClassifyList":[
				{
          "actualDate":"06:00", // 第二步：按照时间起始
          "reservationTypeMap": {
            "S": [  // 第三步：按照类型
              {
                "cmlNo":"TGBU8566995",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              },
              {
                "cmlNo":"TGBU8566996",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              },
            ],
            "V": [
              {
                "cmlNo":"TGBU8566997",
                "reservationType":"V",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              }
            ]
          }
        },
        {
          "actualDate":"09:00", // 第二步：按照时间起始
          "reservationTypeMap": {
            "V": [
              {
                "cmlNo":"TGBU8566997",
                "reservationType":"V",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              }
            ]
          }
        }
			]
    },
    {
			"appointmentTime":"2020-12-02", // 第一步：按照天
			"reservationTimeClassifyList":[
				{
          "actualDate":"06:00", // 第二步：按照时间起始
          "reservationTypeMap": {
            "S": [  // 第三步：按照类型
              {
                "cmlNo":"TGBU8566995",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              },
              {
                "cmlNo":"TGBU8566996",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              },
            ],
            "V": [
              {
                "cmlNo":"TGBU8566997",
                "reservationType":"V",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              }
            ]
          }
        },
        {
          "actualDate":"09:00", // 第二步：按照时间起始
          "reservationTypeMap": {
            "V": [
              {
                "cmlNo":"TGBU8566997",
                "reservationType":"V",
                "receivingPlanNo":"RFCNCNDGMA2008240002"
              }
            ]
          }
        }
			]
		},
	]
}
