var fs = require("fs");
var { v4: uuidv4 } = require("uuid");
var path = require('path');
var express = require("express");
var router = express.Router();

const oneDayInMillisecond = 24 * 60 * 60 * 1000;

// var itemInfo = {
//   uid: uuidv4(),
//   title: "abc",
//   content: "abc",
//   imageUrl:
//     "https://media.wired.com/photos/5b899992404e112d2df1e94e/master/pass/trash2-01.jpg",
//   appliedAt: Date.now(),
//   createdAt: Date.now(),
//   updatedAt: Date.now(),
//   // order: 1,
//   completed: false,
//   completedAt: 9999999999999,
//   dueAt: Date.now(), // undefined
//   repeat: "everyday", // none
//   priority: "normal", // highest, high, medium
// };

function parseData(data) {
  try {
    return JSON.parse(data) || [];
  } catch (err) {
    return [];
  }
}

router.post("/new", function (req, res, next) {
  var newItem = {
    ...req.body,
    uid: uuidv4(),
    appliedAt: req.body?.appliedAt || Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completed: false,
    completedAt: 9999999999999,
  };
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    todo.push(newItem);

    fs.writeFile(path.join(__dirname, "../.output/static/todo.txt"), JSON.stringify(todo), function (err) {
      if (err) {
        res.status(500).json({ success: false, error: err });
        return;
      }
      res.json(newItem);
    });
  });
});

router.put("/update", function (req, res, next) {
  var updatedItem = {
    ...req.body,
    updatedAt: Date.now(),
  };
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    const foundIndex = todo.findIndex((item) => item.uid === updatedItem.uid);
    if (foundIndex > -1) {
      todo[foundIndex] = updatedItem;
    } else {
      res.status(500).json({ success: false, error: null, code: "not_found" });
      return;
    }
    fs.writeFile(path.join(__dirname, "../.output/static/todo.txt"), JSON.stringify(todo), function (err) {
      if (err) {
        res.status(500).json({ success: false, error: err });
        return;
      }
      res.json(updatedItem);
    });
  });
});

router.delete("/:uid", function (req, res, next) {
  var uid = req.params?.uid;
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    const foundIndex = todo.findIndex((item) => item.uid === uid);
    if (foundIndex > -1) {
      todo.splice(foundIndex, 1);
    } else {
      res.status(500).json({ success: false, error: null, code: "not_found" });
      return;
    }
    fs.writeFile(path.join(__dirname, "../.output/static/todo.txt"), JSON.stringify(todo), function (err) {
      if (err) {
        res.status(500).json({ success: false, error: err });
        return;
      }
      res.json({ success: true });
    });
  });
});

router.patch("/mark-completed", function (req, res, next) {
  var completed = req.body?.completed;
  var uid = req.body?.uid;
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    const foundIndex = todo.findIndex((item) => item.uid === uid);
    if (foundIndex > -1) {
      todo[foundIndex] = {
        ...todo[foundIndex],
        completed,
        completedAt: completed ? Date.now() : undefined,
      };
    } else {
      res.status(500).json({ success: false, error: null, code: "not_found" });
      return;
    }
    fs.writeFile(path.join(__dirname, "../.output/static/todo.txt"), JSON.stringify(todo), function (err) {
      if (err) {
        res.status(500).json({ success: false, error: err });
        return;
      }
      res.json(todo[foundIndex]);
    });
  });
});

router.patch("/set-priority", function (req, res, next) {
  var priority = req.body?.priority;
  var uid = req.body?.uid;
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    const foundIndex = todo.findIndex((item) => item.uid === uid);
    if (foundIndex > -1) {
      todo[foundIndex] = {
        ...todo[foundIndex],
        priority,
      };
    } else {
      res.status(500).json({ success: false, error: null, code: "not_found" });
      return;
    }
    fs.writeFile(path.join(__dirname, "../.output/static/todo.txt"), JSON.stringify(todo), function (err) {
      if (err) {
        res.status(500).json({ success: false, error: err });
        return;
      }
      res.json(todo[foundIndex]);
    });
  });
});

router.get("/list/all", function (req, res, next) {
  var title = req.query?.title;
  var status = req.query?.status; //completed, active, today, future, overdue
  var sortByName = req.query?.sortByName; // createdDate, completedDate, appliedDate
  var sortByOrder = req.query?.sortByOrder; // asc, desc
  fs.readFile(path.join(__dirname, "../.output/static/todo.txt"), function (err, data) {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }
    var todo = parseData(data);
    if (title) {
      todo = todo.filter((item) =>
        item.title?.toLowerCase().includes(title?.toLowerCase())
      );
    }
    if (status) {
      const beginTimeOfToday =
        Math.floor(Date.now() / oneDayInMillisecond) * oneDayInMillisecond;
      switch (status) {
        case "completed":
          todo = todo.filter((item) => item.completed);
          break;
        case "active":
          todo = todo.filter((item) => !item.completed);
          break;
        case "today":
          todo = todo.filter(
            (item) =>
              item.appliedAt < beginTimeOfToday + oneDayInMillisecond &&
              item.appliedAt >= beginTimeOfToday
          );
          break;
        case "future":
          todo = todo.filter(
            (item) => item.appliedAt >= beginTimeOfToday + oneDayInMillisecond
          );
          break;
        case "overdue":
          todo = todo.filter((item) => item.appliedAt < beginTimeOfToday);
          break;
        default:
          break;
      }
    }
    if (sortByName && sortByOrder) {
      switch (sortByName) {
        case "createdDate":
          todo.sort(function (a, b) {
            return sortByOrder === "asc"
              ? a.createdAt - b.createdAt
              : b.createdAt - a.createdAt;
          });
          break;
        case "completedDate":
          todo.sort(function (a, b) {
            return sortByOrder === "asc"
              ? a.completedAt - b.completedAt
              : b.completedAt - a.completedAt;
          });
          break;
        case "appliedDate":
          todo.sort(function (a, b) {
            return sortByOrder === "asc"
              ? a.appliedAt - b.appliedAt
              : b.appliedAt - a.appliedAt;
          });
          break;
        default:
          break;
      }
    }
    var groupedTodo = {};
    todo.forEach((item) => {
      const key =
        Math.floor((item?.appliedAt || 0) / oneDayInMillisecond) *
        oneDayInMillisecond;
      if (!groupedTodo[key]) {
        groupedTodo[key] = [item];
      } else {
        groupedTodo[key].push(item);
      }
    });
    res.json({
      list: groupedTodo,
      unCompletedCount: todo.filter((item) => !item.completed).length,
    });
  });
});

module.exports = router;
