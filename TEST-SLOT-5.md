# Test Slot 5 Issue

## Steps to reproduce:

1. **Open browser console** on the doctor schedule page (`/bac-si/lich-lam-viec`)
2. **Try to add slot 5** (10:30 - 11:00) for today
3. **Check browser console** for any errors
4. **Check backend logs** for debug output

## Expected behavior:
- Slot 5 should be added successfully
- Backend should show debug logs from `ScheduleService.addSchedule`

## Debug logs to look for:
```
[ScheduleService.addSchedule] Called with:
  - userId: [USER_ID]
  - dto.date: [DATE]
  - dto.slot: SLOT_5
  - dto.status: RESERVED
```

## If slot 5 fails:
1. Check if the error is in frontend (JavaScript error)
2. Check if the error is in backend (Java exception)
3. Check if the slot enum is being parsed correctly

## Manual test:
Try adding slots 1-4 first, then try slot 5 to see if there's a pattern.
