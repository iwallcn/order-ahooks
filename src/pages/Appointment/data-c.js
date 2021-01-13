export default {
  "data": {
		"isQueue":"N",
		"appointmentPanelUnitList":[
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2020-12-31",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2020-12-30",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2020-12-29",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2020-12-28",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2021-01-03",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2021-01-02",
				"isAppointment":"N"
			},
			{
				"unitTypeList":[
					{
						"appointmentType":"S",
						"beginTime":"06:00",
						"endTime":"06:23:59"
					},
					{
						"appointmentType":"S",
						"beginTime":"07:00",
						"endTime":"07:23:59"
					}
				],
				"appointmentTime":"2021-01-01",
				"isAppointment":"N"
			}
		],
		"isArrangement":"Y"
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
