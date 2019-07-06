"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require('aws-sdk');
const event_aggregator_1 = require("./lib/event-aggregator");
module.exports.aggregator = async (event) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {
            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await event_aggregator_1.processEvent(apiEvent);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQiw2REFBc0Q7QUFFdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsS0FBSyxFQUFFLEtBQTBCLEVBQUUsRUFBRTtJQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkQsS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1FBQzlCLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUVqQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3RSxNQUFNLCtCQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDaEM7S0FDSjtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgQVdTID0gcmVxdWlyZSgnYXdzLXNkaycpO1xuaW1wb3J0IHsgcHJvY2Vzc0V2ZW50IH0gZnJvbSAnLi9saWIvZXZlbnQtYWdncmVnYXRvcic7XG5pbXBvcnQgeyBEeW5hbW9EQlN0cmVhbUV2ZW50IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbm1vZHVsZS5leHBvcnRzLmFnZ3JlZ2F0b3IgPSBhc3luYyAoZXZlbnQ6IER5bmFtb0RCU3RyZWFtRXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyh7IGV2ZW50OiBKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgNCkgfSk7XG4gICAgZm9yIChsZXQgcmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgaWYgKHJlY29yZC5keW5hbW9kYikge1xuXG4gICAgICAgICAgICBjb25zdCBhcGlFdmVudCA9IEFXUy5EeW5hbW9EQi5Db252ZXJ0ZXIudW5tYXJzaGFsbChyZWNvcmQuZHluYW1vZGIuTmV3SW1hZ2UpO1xuICAgICAgICAgICAgYXdhaXQgcHJvY2Vzc0V2ZW50KGFwaUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=