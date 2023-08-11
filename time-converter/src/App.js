import './App.css';
import { TextField, InputLabel } from '@mui/material';
import * as React from 'react';
import timzonesJSON from './timezone.json'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function App() {
  const [fromTimezone, setFromTimezone] = React.useState(timzonesJSON[0]);
	const [timeStamp, setTimeStamp] = React.useState();
	const [date, setDate] = React.useState('');
	const [isInvalidDate, setIsInvalidDate] = React.useState(false);
	const [hour, setHour] = React.useState('');
	const [isInvalidHour, setIsInvalidHour] = React.useState(false);
	const [minute, setMinute] = React.useState('');
	const [isInvalidMinute, setIsInvalidMinute] = React.useState(false);
	const [toTimeZoneListData, setToTimeZoneListData] = React.useState([{
		id: 1,
		result: "",
		toTimezone: timzonesJSON[0]
	},{
		id: 2,
		result: "",
		toTimezone: timzonesJSON.filter(x => x.sys_value === "IST")[0]
	},{
		id: 3,
		result: "",
		toTimezone: timzonesJSON.filter(x => x.sys_value === "PST")[0]
	}]);
 
	const Item = styled(Paper)(({ theme }) => ({
		backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
		...theme.typography.body2,
		padding: theme.spacing(1),
		textAlign: 'center',
		color: theme.palette.text.secondary,
	}));
	const handleFromChange = (event, newValue) => {
		if(newValue) {
			setFromTimezone(newValue);
			calculate(newValue, undefined, true);
		}
	};
	const handleToChange = (event, newValue, id) => {
		if(newValue) {
			toTimeZoneListData.forEach(x => {
				if(x.id === id) {
					x.toTimezone = newValue;
				}
			});
			setToTimeZoneListData([
				...toTimeZoneListData
			]);
			calculate(undefined, undefined, true);
		}
	};
	const removeToTimeZone = (id) => {
		toTimeZoneListData.splice(toTimeZoneListData.findIndex(x => x.id === id), 1);
		setToTimeZoneListData([
			...toTimeZoneListData
		]);
	};
	const addToTimeZone = () => {
		toTimeZoneListData.push({
			id: toTimeZoneListData.flatMap(x => x.id)[toTimeZoneListData.length - 1] + 1,
			result: "",
			toTimezone: timzonesJSON[0]
		});
		setToTimeZoneListData([
			...toTimeZoneListData
		]);
	};
	const handleTimestampChange = (event) => {
		setTimeStamp(event.target.value);
		calculate(undefined, event.target.value, true);
	};
	const handleDateChange = (event) => {
		setDate(event.target.value);
		let tempDate = dayjs(event.target.value, "YYYY-MM-DD").format("YYYY-MM-DD");
		if(tempDate.length < 10 || tempDate.length > 10 || tempDate !== event.target.value) {
			setIsInvalidDate(true);
		} else {
			setIsInvalidDate(false);
			if (hour && minute && fromTimezone.id) {
				var millSec = dayjs(event.target.value + "T" + hour + ":" + minute + ":00" + dayjs().format("Z"), "YYYY-MM-DDTHH:mm:ssZ").valueOf(); // it will return in browser timezone
				millSec = convertTimeStampFromLocal(millSec, event.target.value + "T" + hour + ":" + minute + ":00", fromTimezone.offset);
				calculate(undefined, millSec);
			}
		}
	};
	const handleHourChange = (event) => {
		// if(+event.target.value < 0) {
		// 	event.target.value = "00";
		// }
		// if(+event.target.value > 23) {
		// 	event.target.value = "23";
		// }
		// if(event.target.value.length < 2) {
		// 	event.target.value = "0"+event.target.value;
		// }
		setHour(event.target.value);
		if(!event.target.value || event.target.value.length !== 2 || +event.target.value > 23 || +event.target.value < 0) {
			setIsInvalidHour(true);
		} else {
			setIsInvalidHour(false);
			if (date && minute && fromTimezone.id) {
				var millSec = dayjs(date + "T" + event.target.value + ":" + minute + ":00" + dayjs().format("Z"), "YYYY-MM-DDTHH:mm:ssZ").valueOf();
				millSec = convertTimeStampFromLocal(millSec, date + "T" + event.target.value + ":" + minute + ":00", fromTimezone.offset);
				calculate(undefined, millSec);
			}
		}
	};
	const handleMinuteChange = (event) => {
		// if(+event.target.value < 0) {
		// 	event.target.value = "00";
		// }
		// if(+event.target.value > 59) {
		// 	event.target.value = "59";
		// }
		// if(event.target.value.length < 2) {
		// 	event.target.value = "0"+event.target.value;
		// }
		setMinute(event.target.value);
		if(!event.target.value || event.target.value.length !== 2 || +event.target.value > 59 || +event.target.value < 0) {
			setIsInvalidMinute(true);
		} else {
			setIsInvalidMinute(false);
			if (date && hour && fromTimezone.id) {
				var millSec = dayjs(date + "T" + hour + ":" + event.target.value + ":00" + dayjs().format("Z"), "YYYY-MM-DDTHH:mm:ssZ").valueOf();
				millSec = convertTimeStampFromLocal(millSec, date + "T" + hour + ":" + event.target.value + ":00", fromTimezone.offset);
				calculate(undefined, millSec);
			}
		}
	};
	const calculate = (fTimezone, tStamp, isFromTimestamp) => {
		if (!fTimezone) {
			fTimezone = fromTimezone;
		}
		if (!tStamp) {
			tStamp = timeStamp;
		}
		if (fromTimezone.id && tStamp) {
			dayjs.extend(utc);
			dayjs.extend(timezone);
			if (isFromTimestamp) {
				setDate(dayjs("1970-01-01T00:00:00" + fTimezone.offset, "YYYY-MM-DDTHH:mm:ssZ").add(tStamp).tz(fTimezone.sys_value).format("YYYY-MM-DD"));
				setHour(dayjs("1970-01-01T00:00:00" + fTimezone.offset, "YYYY-MM-DDTHH:mm:ssZ").add(tStamp).tz(fTimezone.sys_value).format("HH"));
				setMinute(dayjs("1970-01-01T00:00:00" + fTimezone.offset, "YYYY-MM-DDTHH:mm:ssZ").add(tStamp).tz(fTimezone.sys_value).format("mm"));
			} else {
				setTimeStamp(tStamp);
			}
			for(let i=0; i<toTimeZoneListData.length; i++) {
				if(toTimeZoneListData[i].toTimezone) {
					toTimeZoneListData[i].result = dayjs("1970-01-01T00:00:00" + fTimezone.offset, "YYYY-MM-DDTHH:mm:ss").add(tStamp).tz(toTimeZoneListData[i].toTimezone.sys_value).format("YYYY-MM-DDTHH:mm:ssZ");
				}
			}
			setToTimeZoneListData([
				...toTimeZoneListData
			]);
		}
	}
	const convertTimeStampFromLocal = (millSec) => {
		return millSec + (dayjs().utcOffset() * 60 * 1000);
	}
	React.useEffect(() => {
		let millSec = convertTimeStampFromLocal(+dayjs());
		setTimeStamp(millSec);
		calculate(undefined, millSec, true);
	}, []);
  return (
    <>
      <div className='mt-3 text-center' style={{ width: "600px" }}>
			<h2>Time Converter</h2>
			<div className='pA dIF'>
				<Autocomplete
					size="small"
					disablePortal
					autoHighlight
					value={fromTimezone.label}
					id="combo-box-demo"
					options={timzonesJSON}
					sx={{ width: 300 }}
					onChange={handleFromChange}
					renderInput={(params) => <TextField {...params} label="Select From Timezone" />}
				/>
			</div>
			<div className='pA dIF' style={{ top: "15px" }}>
				<TextField
					className='w200'
					label="Timestamp"
					variant="outlined"
					type="number"
					size='small'
					value={timeStamp}
					onChange={handleTimestampChange} />
				<span style={{ position: "relative", top: "10px" }} className='pL5 pR5'>Or</span>
				<TextField
					className='w150'
					label="YYYY-MM-DD"
					variant="outlined"
					size='small'
					value={date}
					error={isInvalidDate}
					onChange={handleDateChange} />
				<TextField
					className='w100'
					label="24 Hour(HH)"
					variant="outlined"
					type="number"
					size='small'
					value={hour}
					error={isInvalidHour}
					onChange={handleHourChange} />
				<TextField
					className='w100'
					label="Minute(mm)"
					variant="outlined"
					type="number"
					size='small'
					value={minute}
					error={isInvalidMinute}
					onChange={handleMinuteChange} />
			</div>
			<Box sx={{ width: '100%', top: "25px", height: "300px", overflow: "auto"  }} size="small" className='pA'>
				<Stack spacing={2}>
					{toTimeZoneListData.map(data => (
						<Item>
							<Autocomplete
							size="small"
							disablePortal
							autoHighlight
							value={data.toTimezone.label}
							id={data.id}
							options={timzonesJSON}
							sx={{ width: 300 }}
							onChange={(e, newValue) => handleToChange(e, newValue, data.id)}
							className="dIBImpl"
							renderInput={(params) => <TextField {...params} label="Select To Timezone" />}
							/>
							<AddIcon
								className='dIBImpl pA cP'
								style={{top: "15px", left: "5px"}}
								onClick={() => addToTimeZone()}
							/>
							{data.id > 1 &&
								<RemoveIcon
									className='dIBImpl pA cP'
									style={{top: "15px", left: "5px"}}
									onClick={() => removeToTimeZone(data.id)}
								/>
							}
							<InputLabel className='pL5 pR5 fWBImpl'>Result:: {data.result}</InputLabel>
						</Item>
					))}
				</Stack>
			</Box>
		</div>
    </>
  )
}

export default App;
